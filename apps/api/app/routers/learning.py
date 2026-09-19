from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org, require_roles
from app.models.user import User
from app.models.organization import Organization
from app.services.learning_service import learning_service

router = APIRouter(prefix="/learning", tags=["learning"])

class RecordOutcomeRequest(BaseModel):
    opportunity_id: str
    application_id: Optional[str] = None
    outcome: str = Field(..., description="won | lost | no_bid | disqualified | withdrawn | expired")
    award_value: Optional[float] = None
    currency: Optional[str] = "INR"
    winner_name: Optional[str] = None
    primary_reason_category: Optional[str] = "pricing_commercial"
    detailed_retrospective: Optional[str] = ""
    lessons_learned: Optional[List[str]] = []
    reusable_artifacts: Optional[List[Any]] = []

@router.post("/outcomes")
async def record_outcome(
    req: RecordOutcomeRequest,
    current_user: User = Depends(require_roles('owner', 'admin', 'member', 'capture_lead', 'proposal_writer')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Records a post-pursuit retrospective, updates pursuit status, and extracts institutional learnings.
    """
    valid_outcomes = ["won", "lost", "no_bid", "disqualified", "withdrawn", "expired"]
    if req.outcome not in valid_outcomes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid outcome: '{req.outcome}'. Must be one of: {', '.join(valid_outcomes)}"
        )

    try:
        opp_uuid = uuid.UUID(req.opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID format")

    return await learning_service.record_outcome(
        org_id=org.id,
        outcome_data=req.model_dump(),
        db=db
    )

@router.get("/pulse")
async def get_learning_pulse(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns the organization's win/loss calibration pulse, repeat blockers,
    and indexed proposal artifacts.
    """
    return await learning_service.get_learning_pulse(org_id=org.id, db=db)
