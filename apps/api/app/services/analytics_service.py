from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.application import Application
from app.models.saved_opportunity import SavedOpportunity
from datetime import datetime, timezone, timedelta
import uuid

class AnalyticsService:
    async def get_overview(self, db: AsyncSession, organization_id: uuid.UUID, is_demo_org: bool = False) -> dict:
        # Visibility filter
        if is_demo_org:
            opp_filter = or_(Opportunity.is_demo == True, Opportunity.is_verified == True)
        else:
            opp_filter = or_(Opportunity.is_demo == False, Opportunity.is_demo == None)
        
        # 1. Total opportunities discovered
        total_q = await db.execute(select(func.count(Opportunity.id)).where(opp_filter))
        total = total_q.scalar() or 0
        
        # 2. Opportunities matched for this organization
        matched_q = await db.execute(
            select(func.count(OpportunityScore.id)).where(OpportunityScore.organization_id == organization_id)
        )
        matched_count = matched_q.scalar() or 0

        # 3. Average match score
        avg_score_q = await db.execute(
            select(func.coalesce(func.avg(OpportunityScore.overall_score), 0)).where(
                OpportunityScore.organization_id == organization_id
            )
        )
        avg_match_score = float(avg_score_q.scalar() or 0)

        # 4. High priority opportunities (score >= 85)
        high_pri_q = await db.execute(
            select(func.count(OpportunityScore.id)).where(
                and_(OpportunityScore.organization_id == organization_id, OpportunityScore.overall_score >= 85.0)
            )
        )
        high_priority_count = high_pri_q.scalar() or 0

        # 5. Qualified signals (score >= 70)
        new_matches_q = await db.execute(
            select(func.count(OpportunityScore.id)).where(
                and_(OpportunityScore.organization_id == organization_id, OpportunityScore.overall_score >= 70.0)
            )
        )
        new_matches_count = new_matches_q.scalar() or 0

        # 6. Applications (active pursuits)
        app_q = await db.execute(
            select(func.count(Application.id)).where(Application.organization_id == organization_id)
        )
        total_apps = app_q.scalar() or 0
        
        # 7. Won applications
        won_q = await db.execute(
            select(func.count(Application.id)).where(
                and_(Application.organization_id == organization_id, Application.status == 'won')
            )
        )
        won = won_q.scalar() or 0

        # 8. Pipeline value (sum of value_max of active pursuits)
        pipeline_val_q = await db.execute(
            select(func.coalesce(func.sum(Opportunity.value_max), 0))
            .select_from(Application)
            .join(Opportunity, Application.opportunity_id == Opportunity.id)
            .where(Application.organization_id == organization_id)
        )
        estimated_pipeline_value = float(pipeline_val_q.scalar() or 0)

        # 9. Realized value (sum of value_max of won pursuits)
        realized_val_q = await db.execute(
            select(func.coalesce(func.sum(Opportunity.value_max), 0))
            .select_from(Application)
            .join(Opportunity, Application.opportunity_id == Opportunity.id)
            .where(and_(Application.organization_id == organization_id, Application.status == 'won'))
        )
        realized_value = float(realized_val_q.scalar() or 0)
        
        # 10. Saved opportunities
        saved_q = await db.execute(
            select(func.count(SavedOpportunity.id)).where(SavedOpportunity.organization_id == organization_id)
        )
        saved = saved_q.scalar() or 0
        
        # 11. Upcoming deadlines within 7 days
        next_week = datetime.now(timezone.utc) + timedelta(days=7)
        now = datetime.now(timezone.utc)
        deadline_q = await db.execute(
            select(func.count(Opportunity.id)).where(
                and_(
                    opp_filter,
                    Opportunity.deadline <= next_week,
                    Opportunity.deadline >= now,
                    Opportunity.is_expired == False
                )
            )
        )
        upcoming_deadlines = deadline_q.scalar() or 0
        
        win_rate = (won / total_apps * 100) if total_apps > 0 else 0.0
        
        return {
            'opportunities_discovered': total,
            'opportunities_matched': matched_count,
            'opportunities_pursued': total_apps,
            'opportunities_submitted': total_apps,
            'opportunities_won': won,
            'estimated_pipeline_value': round(estimated_pipeline_value, 2),
            'realized_value': round(realized_value, 2),
            'win_rate': round(win_rate, 1),
            'average_match_score': round(avg_match_score, 1),
            'new_matches_this_week': new_matches_count,
            'deadlines_this_week': upcoming_deadlines,
            'high_priority_count': high_priority_count,
            'saved_count': saved
        }

analytics_service = AnalyticsService()
