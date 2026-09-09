from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.schemas.business_profile import BusinessProfileUpdate, BusinessProfileResponse, OnboardingStepRequest

router = APIRouter()

@router.get('/', response_model=BusinessProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put('/', response_model=BusinessProfileResponse)
async def update_profile(
    data: BusinessProfileUpdate,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    await db.commit()
    await db.refresh(profile)
    return profile

@router.post('/complete-onboarding')
async def complete_onboarding(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if profile:
        profile.onboarding_completed = True
        await db.commit()
    return {"message": "Onboarding completed"}
