from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.services.ingestion_service import ingestion_service
from typing import List, Optional

router = APIRouter()

@router.get('/health')
async def system_health(admin: User = Depends(get_current_admin)):
    return {"status": "ok", "system": "AI Opportunity OS Platform Admin"}

@router.get('/stats')
async def platform_stats(admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    orgs_count = (await db.execute(select(func.count(Organization.id)))).scalar() or 0
    opps_count = (await db.execute(select(func.count(Opportunity.id)))).scalar() or 0
    scores_count = (await db.execute(select(func.count(OpportunityScore.id)))).scalar() or 0

    return {
        "total_users": users_count,
        "total_organizations": orgs_count,
        "total_opportunities": opps_count,
        "total_scores_computed": scores_count,
        "active_crawlers": 7,
        "engine_mode": "Autonomous"
    }

@router.post('/ingest')
async def trigger_ingestion(
    category: Optional[str] = Query(None),
    is_demo: bool = Query(True),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers an autonomous discovery and ingestion batch across 7 opportunity channels.
    """
    result = await ingestion_service.ingest_batch(db, is_demo=is_demo, category_filter=category)
    return result

@router.post('/recalculate-scores')
async def recalculate_all_scores(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Re-scores all indexed opportunities against all active organizations using the 8-dimension engine.
    """
    opps_res = await db.execute(select(Opportunity))
    all_opps = opps_res.scalars().all()
    count = await ingestion_service.score_opportunities_for_all_orgs(db, list(all_opps))
    return {"message": "Recalculation complete", "scores_generated": count}

@router.get('/users')
async def list_users(admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.get('/organizations')
async def list_organizations(admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization))
    return result.scalars().all()

@router.get('/opportunities')
async def list_admin_opportunities(
    admin: User = Depends(get_current_admin), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Opportunity))
    return result.scalars().all()
