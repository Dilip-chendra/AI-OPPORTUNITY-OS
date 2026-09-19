from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org, require_roles
from app.models.user import User
from app.models.organization import Organization
from app.models.application import Application
from app.models.opportunity import Opportunity
from app.models.business_profile import BusinessProfile
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.services.ai_service import ai_service
from typing import List, Dict, Any, Optional
import uuid

router = APIRouter()

@router.get('', response_model=List[ApplicationResponse])
@router.get('/', response_model=List[ApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application)
        .where(Application.organization_id == org.id)
        .order_by(Application.created_at.desc())
    )
    return result.scalars().all()

@router.post('', response_model=ApplicationResponse)
@router.post('/', response_model=ApplicationResponse)
async def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):

    # Fetch opportunity title if available
    opp_res = await db.execute(select(Opportunity).where(Opportunity.id == data.opportunity_id))
    opp = opp_res.scalar_one_or_none()
    title = data.title if data.title and data.title != 'Opportunity Pursuit' else (opp.title if opp else "Opportunity Pursuit")

    app = Application(
        opportunity_id=data.opportunity_id,
        organization_id=org.id,
        title=title,
        assigned_to=current_user.id,
        status="draft"
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app

@router.get('/{id}')
async def get_application(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Fetch associated opportunity
    opp_res = await db.execute(select(Opportunity).where(Opportunity.id == app.opportunity_id))
    opp = opp_res.scalar_one_or_none()

    return {
        "id": str(app.id),
        "organization_id": str(app.organization_id),
        "opportunity_id": str(app.opportunity_id),
        "title": app.title,
        "status": app.status,
        "deadline": app.deadline,
        "submission_date": app.submission_date,
        "outcome": app.outcome,
        "created_at": app.created_at,
        "opportunity": opp
    }

@router.put('/{id}')
async def update_status(
    id: uuid.UUID,
    status: str = Query(...),
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app.status = status
    await db.commit()
    await db.refresh(app)
    return app

@router.get('/{id}/compliance-matrix')
async def get_compliance_matrix(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    opp_res = await db.execute(select(Opportunity).where(Opportunity.id == app.opportunity_id))
    opp = opp_res.scalar_one_or_none()

    p_res = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = p_res.scalar_one_or_none()

    context = {
        'org_name': org.name,
        'industry': profile.industry if profile else 'Technology',
    }

    reqs = opp.requirements if opp and opp.requirements else []
    matrix = await ai_service.generate_compliance_matrix(app.title, reqs, context)
    return {"application_id": str(id), "matrix": matrix}

@router.post('/{id}/draft-proposal')
async def draft_proposal(
    id: uuid.UUID,
    section_type: str = Body(..., embed=True),
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'analyst', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    p_res = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = p_res.scalar_one_or_none()

    context = {
        'org_name': org.name,
        'industry': profile.industry if profile else 'Technology',
    }

    draft = await ai_service.draft_proposal_section(app.title, section_type, context)
    return {"section_type": section_type, "content": draft}


@router.get('/{id}/deadline-plan')
async def get_deadline_plan(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Return existing or auto-generate a deadline execution plan for the application."""
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.deadline_plan:
        return {'plan': app.deadline_plan, 'generated': False}

    from app.services.deadline_service import deadline_service
    plan = deadline_service.generate_plan(app.deadline)
    app.deadline_plan = plan
    await db.commit()
    return {'plan': plan, 'generated': True}


@router.post('/{id}/deadline-plan/regenerate')
async def regenerate_deadline_plan(
    id: uuid.UUID,
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    from app.services.deadline_service import deadline_service
    plan = deadline_service.generate_plan(app.deadline)
    app.deadline_plan = plan
    await db.commit()
    return {'plan': plan, 'generated': True}


@router.get('/{id}/checklist')
async def get_checklist(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    checklist = app.submission_checklist or _default_checklist()
    if not app.submission_checklist:
        app.submission_checklist = checklist
        await db.commit()
    return {'checklist': checklist}


@router.patch('/{id}/checklist/{item_index}')
async def update_checklist_item(
    id: uuid.UUID,
    item_index: int,
    done: bool = Body(..., embed=True),
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    checklist = list(app.submission_checklist or _default_checklist())
    if item_index < 0 or item_index >= len(checklist):
        raise HTTPException(status_code=400, detail="Invalid item index")

    checklist[item_index]['done'] = done
    app.submission_checklist = checklist
    await db.commit()
    return {'checklist': checklist}


@router.patch('/{id}/compliance-matrix')
async def update_compliance_matrix(
    id: uuid.UUID,
    matrix: list = Body(..., embed=True),
    current_user: User = Depends(require_roles('owner', 'admin', 'manager', 'member')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(Application.id == id, Application.organization_id == org.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.compliance_matrix = matrix
    await db.commit()
    return {'saved': True, 'total': len(matrix)}


def _default_checklist():
    return [
        {'task': 'Confirm bid/no-bid decision', 'done': False, 'category': 'planning'},
        {'task': 'Assign pursuit lead and team', 'done': False, 'category': 'planning'},
        {'task': 'Download and read full RFP/tender document', 'done': False, 'category': 'requirements'},
        {'task': 'Extract all mandatory requirements', 'done': False, 'category': 'requirements'},
        {'task': 'Complete compliance matrix', 'done': False, 'category': 'compliance'},
        {'task': 'Gather all required eligibility documents', 'done': False, 'category': 'compliance'},
        {'task': 'Draft executive summary', 'done': False, 'category': 'proposal'},
        {'task': 'Draft technical approach section', 'done': False, 'category': 'proposal'},
        {'task': 'Prepare commercial/pricing section', 'done': False, 'category': 'proposal'},
        {'task': 'Internal review and sign-off', 'done': False, 'category': 'review'},
        {'task': 'Check submission portal access', 'done': False, 'category': 'submission'},
        {'task': 'Submit all documents before deadline', 'done': False, 'category': 'submission'},
        {'task': 'Obtain submission acknowledgement', 'done': False, 'category': 'submission'},
    ]
