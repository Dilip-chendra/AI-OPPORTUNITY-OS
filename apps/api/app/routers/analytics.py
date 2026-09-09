from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.schemas.analytics import AnalyticsOverview
from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get('/overview', response_model=AnalyticsOverview)
async def get_overview(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    return await analytics_service.get_overview(db, org.id, org.is_demo)
