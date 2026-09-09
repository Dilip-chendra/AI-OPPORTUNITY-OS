from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.schemas.opportunity import OpportunityListItem
from app.schemas.common import PaginatedResponse
from app.services.opportunity_service import opportunity_service
from typing import Optional

router = APIRouter()

@router.get('/', response_model=PaginatedResponse[OpportunityListItem])
async def search_opportunities(
    q: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
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
        search=q,
        is_demo_org=org.is_demo
    )
