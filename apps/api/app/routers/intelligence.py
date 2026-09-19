from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.services.intelligence_service import intelligence_service

router = APIRouter()

class SimulationRequest(BaseModel):
    opportunity_id: str
    add_certifications: Optional[List[str]] = []
    add_capabilities: Optional[List[str]] = []
    partner_oem: Optional[bool] = False
    consortium: Optional[bool] = False
    turnover_override: Optional[float] = None

@router.get("/threads/{opportunity_id}")
async def get_opportunity_thread(
    opportunity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the complete procurement lifecycle thread for an opportunity:
    Early signals, RFI, RFP, Corrigendum, Submission window, Evaluation, Award, and Recompete.
    """
    res = await intelligence_service.get_opportunity_thread(opportunity_id, db)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/buyers/{buyer_name:path}")
async def get_buyer_360(
    buyer_name: str,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get Buyer 360 intelligence:
    Historical spend, cadence, top tech requirements, and fit with your Business DNA.
    """
    return await intelligence_service.get_buyer_360(buyer_name, org.id, db)

@router.get("/whitespace")
async def get_opportunity_whitespace(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Analyze uncontested market opportunities, adjacent capability clusters,
    and underserved buyers matched to your verified Business DNA.
    """
    return await intelligence_service.get_whitespace(org.id, db)

@router.get("/work-queue")
async def get_smart_work_queue(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get prioritized, actionable weekly agenda:
    Imminent submission deadlines, high-match unreviewed opportunities, and Business DNA upgrades.
    """
    return await intelligence_service.get_work_queue(org.id, db)

@router.post("/simulate")
async def simulate_opportunity(
    body: SimulationRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Opportunity Simulator:
    Evaluate counterfactual scenarios (e.g. consortium, ISO certs, OEM partnership)
    to calculate score improvement and win probability increase.
    """
    try:
        opp_uuid = uuid.UUID(body.opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity_id format")

    scenario = {
        "add_certifications": body.add_certifications,
        "add_capabilities": body.add_capabilities,
        "partner_oem": body.partner_oem,
        "consortium": body.consortium,
        "turnover_override": body.turnover_override
    }

    res = await intelligence_service.simulate_opportunity(org.id, opp_uuid, scenario, db)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
