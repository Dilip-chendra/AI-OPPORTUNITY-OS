from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org, require_roles
from app.models.user import User
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.business_profile_version import BusinessProfileVersion
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.schemas.business_profile import (
    BusinessProfileUpdate, BusinessProfileResponse, OnboardingStepRequest, DocumentMetadata,
    BusinessContextResponse, CompletenessResponse, ReadinessResponse, DNAImpactResponse, BusinessProfileVersionResponse
)
from app.services.scoring_service import scoring_engine
from app.services.business_context_service import business_context_service
import uuid
from datetime import datetime, timezone
from typing import List

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

@router.get('/context', response_model=BusinessContextResponse)
async def get_business_context(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Returns the compiled single source of truth context for the active organization."""
    return await business_context_service.get_context(org.id, db)

@router.get('/completeness', response_model=CompletenessResponse)
async def get_completeness(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates Business DNA completeness score and returns exact missing items."""
    ctx = await business_context_service.get_context(org.id, db)
    return ctx["completeness"]

@router.get('/readiness', response_model=ReadinessResponse)
async def get_readiness(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates commercial and procurement readiness gaps for competitive bids."""
    ctx = await business_context_service.get_context(org.id, db)
    return ctx["readiness"]

@router.get('/impact', response_model=DNAImpactResponse)
async def get_latest_impact(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Returns the opportunity recalculation impact metrics from the most recent DNA update."""
    ver_res = await db.execute(
        select(BusinessProfileVersion)
        .where(BusinessProfileVersion.organization_id == org.id)
        .order_by(desc(BusinessProfileVersion.version))
        .limit(1)
    )
    latest = ver_res.scalar_one_or_none()
    if not latest or not latest.impact_summary:
        return {
            "re_evaluated": 0,
            "score_improved": 0,
            "score_decreased": 0,
            "newly_eligible": 0,
            "high_relevance_count": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "trigger_reason": "Baseline profile initialized"
        }
    return latest.impact_summary

@router.get('/versions', response_model=List[BusinessProfileVersionResponse])
async def get_version_history(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Returns the complete audit log of Business DNA versions and change diffs."""
    res = await db.execute(
        select(BusinessProfileVersion)
        .where(BusinessProfileVersion.organization_id == org.id)
        .order_by(desc(BusinessProfileVersion.version))
        .limit(20)
    )
    versions = res.scalars().all()
    return [
        BusinessProfileVersionResponse(
            id=str(v.id),
            version=v.version,
            changed_fields=v.changed_fields,
            diff=v.diff,
            reason=v.reason,
            impact_summary=v.impact_summary,
            created_at=v.created_at
        )
        for v in versions
    ]

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

    # Capture snapshot before updating
    old_snapshot = {
        "company_name": profile.company_name,
        "industry": profile.industry,
        "capabilities": list(profile.capabilities or []),
        "tech_stack": list(profile.tech_stack or []),
        "certifications": list(profile.certifications or []),
        "preferred_contract_min": float(profile.preferred_contract_min or 0),
        "preferred_contract_max": float(profile.preferred_contract_max or 0),
        "geographic_coverage": list(profile.geographic_coverage or []),
    }
    
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

    # Emit BUSINESS_DNA_UPDATED event: versioning, re-scoring, and impact calculation
    try:
        await business_context_service.handle_dna_update(
            profile=profile,
            user_id=current_user.id,
            updated_fields=update_data,
            old_snapshot=old_snapshot,
            reason=None,
            db=db
        )
    except Exception as e:
        print(f"[Warning] Failed in handle_dna_update: {e}")

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
        await db.refresh(profile)
        # Ensure opportunity scoring runs for newly onboarded organization
        try:
            await business_context_service.handle_dna_update(
                profile=profile,
                user_id=current_user.id,
                updated_fields={"onboarding_completed": True},
                old_snapshot={"onboarding_completed": False},
                reason="Onboarding completed — baseline intelligence calibrated",
                db=db
            )
        except Exception as e:
            print(f"[Warning] Failed to calibrate initial DNA in complete_onboarding: {e}")
    return {"message": "Onboarding completed"}

