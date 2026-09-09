from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.schemas.opportunity import OpportunityResponse, OpportunityListItem
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.opportunity_service import opportunity_service
from typing import Optional, List
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

@router.post('/{id}/save', response_model=MessageResponse)
async def save_opportunity(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    success = await opportunity_service.save_opportunity(db, current_user.id, org.id, id)
    return MessageResponse(message="Saved" if success else "Already saved", success=True)

@router.delete('/{id}/save', response_model=MessageResponse)
async def unsave_opportunity(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await opportunity_service.unsave_opportunity(db, current_user.id, id)
    return MessageResponse(message="Unsaved" if success else "Not saved", success=True)
