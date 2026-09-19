from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.common import PaginatedResponse
import uuid
import math

class OpportunityService:
    async def list_opportunities(
        self,
        db: AsyncSession,
        organization_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        opportunity_type: Optional[str] = None,
        geography_country: Optional[str] = None,
        value_min: Optional[float] = None,
        value_max: Optional[float] = None,
        search: Optional[str] = None,
        sort_by: str = 'created_at',
        sort_order: str = 'desc',
        is_demo_org: bool = False
    ) -> dict:
        # Base query — show demo + verified public opps to demo orgs, real opps to real orgs
        query = select(Opportunity)
        if is_demo_org:
            query = query.where(or_(Opportunity.is_demo == True, Opportunity.is_verified == True))
        else:
            query = query.where(or_(Opportunity.is_demo == False, Opportunity.is_demo == None))
        
        query = query.where(Opportunity.is_expired == False)
        
        if category:
            query = query.where(Opportunity.category == category)
        if opportunity_type:
            query = query.where(Opportunity.opportunity_type == opportunity_type)
        if geography_country:
            query = query.where(Opportunity.geography_country.ilike(f'%{geography_country}%'))
        if value_min is not None:
            query = query.where(Opportunity.value_max >= value_min)
        if value_max is not None:
            query = query.where(Opportunity.value_min <= value_max)
        if search:
            query = query.where(
                or_(
                    Opportunity.title.ilike(f'%{search}%'),
                    Opportunity.description.ilike(f'%{search}%'),
                    Opportunity.organization_name.ilike(f'%{search}%')
                )
            )
        
        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Order
        order_col = getattr(Opportunity, sort_by, Opportunity.created_at)
        if sort_order == 'desc':
            query = query.order_by(order_col.desc())
        else:
            query = query.order_by(order_col.asc())
        
        # Paginate
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        result = await db.execute(query)
        opportunities = list(result.scalars().all())
        
        # Attach scores if available
        if opportunities:
            opp_ids = [o.id for o in opportunities]
            score_q = select(OpportunityScore).where(
                and_(OpportunityScore.opportunity_id.in_(opp_ids), OpportunityScore.organization_id == organization_id)
            )
            score_res = await db.execute(score_q)
            score_map = {s.opportunity_id: s for s in score_res.scalars().all()}
            for o in opportunities:
                if o.id in score_map:
                    o.score = score_map[o.id]
        
        return {
            'data': opportunities,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': math.ceil(total / page_size) if total > 0 else 0,
            'has_next': page * page_size < total,
            'has_prev': page > 1
        }
    
    async def get_opportunity(self, db: AsyncSession, opportunity_id: uuid.UUID, organization_id: Optional[uuid.UUID] = None) -> Optional[Opportunity]:
        result = await db.execute(
            select(Opportunity).where(Opportunity.id == opportunity_id)
        )
        opp = result.scalar_one_or_none()
        if opp:
            # Try to fetch score
            score_query = select(OpportunityScore).where(OpportunityScore.opportunity_id == opportunity_id)
            if organization_id:
                score_query = score_query.where(OpportunityScore.organization_id == organization_id)
            score_res = await db.execute(score_query)
            score = score_res.scalar_one_or_none()
            if score:
                opp.score = score
        return opp
    
    async def get_recommendations(
        self, db: AsyncSession, organization_id: uuid.UUID, is_demo_org: bool = False, limit: int = 10
    ) -> List[Opportunity]:
        # Get opportunities with scores for this org, ordered by score
        query = (
            select(Opportunity)
            .join(OpportunityScore, and_(
                OpportunityScore.opportunity_id == Opportunity.id,
                OpportunityScore.organization_id == organization_id
            ))
            .where(Opportunity.is_expired == False)
        )
        if is_demo_org:
            query = query.where(Opportunity.is_demo == True)
        else:
            query = query.where(or_(Opportunity.is_demo == False, Opportunity.is_demo == None))
        
        query = query.order_by(OpportunityScore.overall_score.desc()).limit(limit)
        result = await db.execute(query)
        opps = list(result.scalars().all())
        
        # If no scored opps, return latest opportunities
        if not opps:
            fallback = select(Opportunity).where(Opportunity.is_expired == False)
            if is_demo_org:
                fallback = fallback.where(or_(Opportunity.is_demo == True, Opportunity.is_verified == True))
            else:
                fallback = fallback.where(or_(Opportunity.is_demo == False, Opportunity.is_demo == None))
            fallback = fallback.order_by(Opportunity.created_at.desc()).limit(limit)
            result2 = await db.execute(fallback)
            opps = list(result2.scalars().all())
            
        # Attach scores if available
        if opps:
            opp_ids = [o.id for o in opps]
            score_q = select(OpportunityScore).where(
                and_(OpportunityScore.opportunity_id.in_(opp_ids), OpportunityScore.organization_id == organization_id)
            )
            score_res = await db.execute(score_q)
            score_map = {s.opportunity_id: s for s in score_res.scalars().all()}
            for o in opps:
                if o.id in score_map:
                    o.score = score_map[o.id]
        return opps
    
    async def save_opportunity(self, db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID, opportunity_id: uuid.UUID) -> bool:
        existing = await db.execute(
            select(SavedOpportunity).where(
                and_(SavedOpportunity.user_id == user_id, SavedOpportunity.opportunity_id == opportunity_id)
            )
        )
        if existing.scalar_one_or_none():
            return False  # Already saved
        saved = SavedOpportunity(user_id=user_id, organization_id=org_id, opportunity_id=opportunity_id)
        db.add(saved)
        await db.commit()
        return True
    
    async def unsave_opportunity(self, db: AsyncSession, user_id: uuid.UUID, opportunity_id: uuid.UUID) -> bool:
        result = await db.execute(
            select(SavedOpportunity).where(
                and_(SavedOpportunity.user_id == user_id, SavedOpportunity.opportunity_id == opportunity_id)
            )
        )
        saved = result.scalar_one_or_none()
        if not saved:
            return False
        await db.delete(saved)
        await db.commit()
        return True
    
    async def get_saved_opportunities(self, db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID) -> List[Opportunity]:
        result = await db.execute(
            select(Opportunity)
            .join(SavedOpportunity, and_(
                SavedOpportunity.opportunity_id == Opportunity.id,
                SavedOpportunity.user_id == user_id
            ))
            .order_by(SavedOpportunity.created_at.desc())
        )
        return result.scalars().all()

opportunity_service = OpportunityService()
