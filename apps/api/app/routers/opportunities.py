from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org, require_roles
from app.models.user import User
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.schemas.opportunity import OpportunityResponse, OpportunityListItem
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.opportunity_service import opportunity_service
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()

@router.get('', response_model=PaginatedResponse[OpportunityListItem])
@router.get('/', response_model=PaginatedResponse[OpportunityListItem])
async def list_opportunities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    opportunity_type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    return await opportunity_service.list_opportunities(
        db=db,
        organization_id=org.id,
        page=page,
        page_size=page_size,
        category=category,
        opportunity_type=opportunity_type,
        search=search,
        is_demo_org=org.is_demo
    )


@router.get('/stats')
async def get_opportunity_stats(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns real opportunity counts for the radar dashboard.
    No fake numbers — every value is a live DB aggregate.
    """
    is_demo = org.is_demo
    if is_demo:
        opp_filter = or_(Opportunity.is_demo == True, Opportunity.is_verified == True)
    else:
        opp_filter = or_(Opportunity.is_demo == False, Opportunity.is_demo == None)

    base_filter = and_(opp_filter, Opportunity.is_expired == False)

    # Total discovered (non-expired)
    total_q = await db.execute(select(func.count(Opportunity.id)).where(base_filter))
    total = total_q.scalar() or 0

    # Matched = opportunities with a score for this org
    matched_q = await db.execute(
        select(func.count(OpportunityScore.id)).where(
            OpportunityScore.organization_id == org.id
        )
    )
    matched = matched_q.scalar() or 0

    # High relevance = score >= 85
    high_rel_q = await db.execute(
        select(func.count(OpportunityScore.id)).where(
            and_(
                OpportunityScore.organization_id == org.id,
                OpportunityScore.overall_score >= 85.0
            )
        )
    )
    high_relevance = high_rel_q.scalar() or 0

    # Urgent = deadline within 14 days
    now = datetime.now(timezone.utc)
    soon = now + timedelta(days=14)
    urgent_q = await db.execute(
        select(func.count(Opportunity.id)).where(
            and_(
                base_filter,
                Opportunity.deadline != None,
                Opportunity.deadline >= now,
                Opportunity.deadline <= soon,
            )
        )
    )
    urgent = urgent_q.scalar() or 0

    # Per-category counts
    cat_q = await db.execute(
        select(Opportunity.category, func.count(Opportunity.id))
        .where(base_filter)
        .group_by(Opportunity.category)
    )
    by_category = {row[0] or 'other': row[1] for row in cat_q.all()}

    return {
        'total': total,
        'matched': matched,
        'high_relevance': high_relevance,
        'urgent': urgent,
        'by_category': by_category,
    }


@router.get('/saved', response_model=List[OpportunityListItem])
async def get_saved_opportunities(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    return await opportunity_service.get_saved_opportunities(db, current_user.id, org.id)

@router.get('/recommendations', response_model=List[OpportunityListItem])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    return await opportunity_service.get_recommendations(db, org.id, org.is_demo)

@router.get('/{id}', response_model=OpportunityResponse)
async def get_opportunity(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    opp = await opportunity_service.get_opportunity(db, id, org.id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.get('/{id}/why')
async def get_opportunity_why(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Returns Why/Why Not Engine explanation for this opportunity vs this org's DNA."""
    from app.models.business_profile import BusinessProfile
    from app.services.scoring_service import ScoringEngine

    opp = await opportunity_service.get_opportunity(db, id, org.id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    prof_r = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = prof_r.scalar_one_or_none()

    engine = ScoringEngine()
    score_obj = engine.compute_scores(profile, opp, org.id)
    explanation = engine.explain(profile, opp, score_obj)
    return explanation


@router.get('/{id}/health')
async def get_opportunity_health(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Returns data quality & freshness health indicators for an opportunity."""
    from app.models.business_profile import BusinessProfile

    opp = await opportunity_service.get_opportunity(db, id, org.id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    now = datetime.now(timezone.utc)
    freshness_days = None
    if opp.last_updated:
        delta = now - opp.last_updated.replace(tzinfo=timezone.utc) if opp.last_updated.tzinfo is None else now - opp.last_updated
        freshness_days = delta.days

    # Data completeness: count how many key fields are populated
    key_fields = [opp.description, opp.deadline, opp.value_max, opp.organization_name,
                  opp.eligibility_criteria, opp.requirements, opp.source_url]
    filled = sum(1 for f in key_fields if f)
    completeness = round((filled / len(key_fields)) * 100)

    source_health = 'verified' if opp.is_verified else ('stale' if freshness_days and freshness_days > 30 else 'unverified')

    return {
        'source_health': source_health,
        'data_completeness': completeness,
        'freshness_days': freshness_days,
        'is_verified': opp.is_verified,
        'verification_status': opp.verification_status,
        'source_url': opp.source_url,
        'last_updated': opp.last_updated.isoformat() if opp.last_updated else None,
    }


@router.post('/{id}/save', response_model=MessageResponse)
async def save_opportunity(
    id: uuid.UUID,
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'analyst', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    success = await opportunity_service.save_opportunity(db, current_user.id, org.id, id)
    return MessageResponse(message="Saved" if success else "Already saved", success=True)

@router.delete('/{id}/save', response_model=MessageResponse)
async def unsave_opportunity(
    id: uuid.UUID,
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'analyst', 'member')),
    db: AsyncSession = Depends(get_db)
):
    success = await opportunity_service.unsave_opportunity(db, current_user.id, id)
    return MessageResponse(message="Unsaved" if success else "Not saved", success=True)
