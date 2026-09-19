from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.application import Application
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid

router = APIRouter()

# Ordered lifecycle stages
LIFECYCLE_STAGES = [
    'early_signal', 'forecast', 'pre_rfp', 'rfi', 'rfp',
    'drafting', 'review', 'submitted', 'evaluation',
    'award', 'active_contract', 'recompete', 'closed'
]


class TransitionRequest(BaseModel):
    stage: str
    notes: Optional[str] = None


@router.post('/{application_id}/transition')
async def transition_lifecycle(
    application_id: uuid.UUID,
    data: TransitionRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Move an application to a new lifecycle stage.
    Records the transition in the lifecycle_thread audit trail.
    """
    if data.stage not in LIFECYCLE_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage '{data.stage}'. Valid: {LIFECYCLE_STAGES}"
        )

    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.organization_id == org.id
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Build lifecycle event
    event = {
        'stage': data.stage,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'actor_id': str(current_user.id),
        'notes': data.notes or '',
    }

    # Append to thread
    thread = list(app.lifecycle_thread or [])
    thread.append(event)
    app.lifecycle_thread = thread
    app.lifecycle_stage = data.stage

    await db.commit()
    await db.refresh(app)

    return {
        'application_id': str(app.id),
        'current_stage': app.lifecycle_stage,
        'event': event,
        'thread_length': len(thread),
    }


@router.get('/{application_id}/timeline')
async def get_timeline(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Returns the full lifecycle stage history for an application."""
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.organization_id == org.id
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    return list(app.lifecycle_thread or [])
