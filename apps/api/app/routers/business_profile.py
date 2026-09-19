from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org, require_roles
from app.models.user import User
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.schemas.business_profile import BusinessProfileUpdate, BusinessProfileResponse, OnboardingStepRequest, DocumentMetadata
from app.services.scoring_service import scoring_engine
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get('', response_model=BusinessProfileResponse)
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

@router.put('', response_model=BusinessProfileResponse)
@router.put('/', response_model=BusinessProfileResponse)
async def update_profile(
    data: BusinessProfileUpdate,
    current_user: User = Depends(require_roles('owner', 'admin')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Clean capabilities and certifications if passed as strings
    if 'capabilities' in update_data and isinstance(update_data['capabilities'], str):
        update_data['capabilities'] = [c.strip() for c in update_data['capabilities'].split(',') if c.strip()]
    if 'tech_stack' in update_data and isinstance(update_data['tech_stack'], str):
        update_data['tech_stack'] = [t.strip() for t in update_data['tech_stack'].split(',') if t.strip()]

    for key, value in update_data.items():
        setattr(profile, key, value)
    
    org_res = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    active_org = org_res.scalar_one_or_none()
    if active_org and profile.company_name:
        active_org.name = profile.company_name

    await db.commit()
    await db.refresh(profile)

    # Automatically recalculate scores for all indexed opportunities for this organization
    try:
        opp_res = await db.execute(select(Opportunity).where(Opportunity.is_expired == False))
        opps = opp_res.scalars().all()
        for opp in opps:
            # Check if score exists
            sc_res = await db.execute(
                select(OpportunityScore).where(
                    OpportunityScore.opportunity_id == opp.id,
                    OpportunityScore.organization_id == org.id
                )
            )
            existing_score = sc_res.scalar_one_or_none()
            new_score = scoring_engine.compute_scores(profile, opp, org.id)
            if existing_score:
                existing_score.overall_score = new_score.overall_score
                existing_score.eligibility_score = new_score.eligibility_score
                existing_score.business_fit_score = new_score.business_fit_score
                existing_score.capability_fit_score = new_score.capability_fit_score
                existing_score.geographic_fit_score = new_score.geographic_fit_score
                existing_score.value_fit_score = new_score.value_fit_score
                existing_score.time_feasibility_score = new_score.time_feasibility_score
                existing_score.competition_score = new_score.competition_score
                existing_score.execution_fit_score = new_score.execution_fit_score
                existing_score.recommendation = new_score.recommendation
                existing_score.recommendation_reason = new_score.recommendation_reason
            else:
                db.add(new_score)
        await db.commit()
    except Exception as e:
        # Non-blocking for profile update
        print(f"[Warning] Failed to re-score opportunities on profile update: {e}")

    return profile

@router.post('/documents', response_model=BusinessProfileResponse)
async def add_document(
    doc: DocumentMetadata,
    current_user: User = Depends(require_roles('owner', 'admin')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    docs = list(profile.documents or [])
    new_doc = {
        'id': str(uuid.uuid4())[:8],
        'title': doc.title,
        'document_type': doc.document_type,
        'file_url': doc.file_url or '#',
        'uploaded_at': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')
    }
    docs.append(new_doc)
    profile.documents = docs
    await db.commit()
    await db.refresh(profile)
    return profile

@router.delete('/documents/{doc_id}', response_model=BusinessProfileResponse)
async def remove_document(
    doc_id: str,
    current_user: User = Depends(require_roles('owner', 'admin')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    docs = [d for d in (profile.documents or []) if d.get('id') != doc_id]
    profile.documents = docs
    await db.commit()
    await db.refresh(profile)
    return profile

@router.post('/complete-onboarding')
async def complete_onboarding(
    current_user: User = Depends(require_roles('owner', 'admin')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = result.scalar_one_or_none()
    if profile:
        profile.onboarding_completed = True
        await db.commit()
    return {"message": "Onboarding completed"}
