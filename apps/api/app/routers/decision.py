from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org, require_roles
from app.models.user import User
from app.models.organization import Organization
from app.services.decision_service import decision_service

router = APIRouter(prefix="/decision", tags=["decision"])

class EvaluateBidRequest(BaseModel):
    opportunity_id: str
    margin_pct: Optional[float] = 25.0
    effort_days: Optional[float] = None
    blended_day_rate: Optional[float] = 8000.0

class CommitDecisionRequest(BaseModel):
    opportunity_id: str
    decision: str = Field(..., description="pursue | no_bid | partner_needed | watch")
    rationale: str
    assumptions: Optional[List[str]] = []
    hard_gates_status: Optional[Dict[str, Any]] = None
    economic_evaluation: Optional[Dict[str, Any]] = None
    capacity_impact: Optional[Dict[str, Any]] = None
    partner_requirements: Optional[List[str]] = []

@router.post("/evaluate")
async def evaluate_bid(
    req: EvaluateBidRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Evaluates multi-factor bid readiness (Hard Gates, Soft Signals, Economics, and Capacity).
    """
    try:
        opp_uuid = uuid.UUID(req.opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID format")

    res = await decision_service.evaluate_bid_readiness(
        org_id=org.id,
        opportunity_id=opp_uuid,
        user_inputs=req.model_dump(),
        db=db
    )
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/commit")
async def commit_decision(
    req: CommitDecisionRequest,
    current_user: User = Depends(require_roles('owner', 'admin', 'member', 'capture_lead', 'proposal_writer')),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Records an immutable Bid/No-Bid decision into the Decision Journal and coordinates pursuit workflow.
    """
    if req.decision not in ["pursue", "no_bid", "partner_needed", "watch"]:
        raise HTTPException(status_code=400, detail="Invalid decision value. Must be pursue, no_bid, partner_needed, or watch.")

    try:
        opp_uuid = uuid.UUID(req.opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID format")

    return await decision_service.record_decision(
        org_id=org.id,
        user_id=current_user.id,
        decision_data=req.model_dump(),
        db=db
    )

@router.get("/journal")
async def get_journal(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns the organization's immutable Decision Journal timeline.
    """
    return await decision_service.get_decision_history(org_id=org.id, limit=limit, db=db)

@router.get("/portfolio")
async def get_portfolio_capacity_map(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Analyzes active pursuits, workload capacity utilization, and deadline collisions.
    """
    return await decision_service.get_portfolio_capacity(org_id=org.id, db=db)
