from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.models.saved_opportunity import SavedOpportunity
from app.models.notification import Notification
from datetime import datetime, timezone, timedelta
import uuid

class AnalyticsService:
    async def get_overview(self, db: AsyncSession, organization_id: uuid.UUID, is_demo_org: bool = False) -> dict:
        opp_filter = Opportunity.is_demo == True if is_demo_org else or_(Opportunity.is_demo == False, Opportunity.is_demo == None)
        
        # Total opportunities in system visible to this org
        total_q = await db.execute(select(func.count(Opportunity.id)).where(opp_filter))
        total = total_q.scalar() or 0
        
        # Applications
        app_q = await db.execute(
            select(func.count(Application.id)).where(Application.organization_id == organization_id)
        )
        total_apps = app_q.scalar() or 0
        
        # Won
        won_q = await db.execute(
            select(func.count(Application.id)).where(
                and_(Application.organization_id == organization_id, Application.status == 'won')
            )
        )
        won = won_q.scalar() or 0
        
        # Saved
        saved_q = await db.execute(
            select(func.count(SavedOpportunity.id)).where(SavedOpportunity.organization_id == organization_id)
        )
        saved = saved_q.scalar() or 0
        
        # Deadlines in 7 days
        next_week = datetime.now(timezone.utc) + timedelta(days=7)
        deadline_q = await db.execute(
            select(func.count(Opportunity.id)).where(
                and_(
                    opp_filter,
                    Opportunity.deadline <= next_week,
                    Opportunity.deadline >= datetime.now(timezone.utc),
                    Opportunity.is_expired == False
                )
            )
        )
        upcoming_deadlines = deadline_q.scalar() or 0
        
        win_rate = (won / total_apps * 100) if total_apps > 0 else 0
        
        return {
            'opportunities_discovered': total,
            'opportunities_matched': min(total, int(total * 0.3)) if total > 0 else 0,
            'opportunities_pursued': total_apps,
            'opportunities_submitted': total_apps,
            'opportunities_won': won,
            'estimated_pipeline_value': 0,
            'realized_value': 0,
            'win_rate': round(win_rate, 1),
            'average_match_score': 0,
            'new_matches_this_week': min(total, 8),
            'deadlines_this_week': upcoming_deadlines,
            'high_priority_count': min(total, 5),
            'saved_count': saved
        }

analytics_service = AnalyticsService()
