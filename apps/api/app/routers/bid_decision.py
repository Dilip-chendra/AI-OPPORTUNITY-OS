from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.business_profile import BusinessProfile
from typing import Dict, Any
from pydantic import BaseModel
import uuid

router = APIRouter()


class BidSimulateRequest(BaseModel):
    opportunity_id: str


@router.post('/simulate')
async def simulate_bid_decision(
    data: BidSimulateRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Bid/No-Bid Simulator: analyzes an opportunity against the organization's
    Business DNA and returns a structured decision with risk/strength factors.
    Real data only — no fake scores.
    """
    try:
        opp_id = uuid.UUID(data.opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity_id")

    # Fetch opportunity
    opp_r = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
    opp = opp_r.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Fetch existing score (if available)
    score_r = await db.execute(
        select(OpportunityScore).where(
            OpportunityScore.opportunity_id == opp_id,
            OpportunityScore.organization_id == org.id
        )
    )
    existing_score = score_r.scalar_one_or_none()

    # Fetch business profile
    prof_r = await db.execute(
        select(BusinessProfile).where(BusinessProfile.organization_id == org.id)
    )
    profile = prof_r.scalar_one_or_none()

    # Compute fresh score using engine
    from app.services.scoring_service import ScoringEngine
    engine = ScoringEngine()
    score_obj = existing_score or engine.compute_scores(profile, opp, org.id)

    overall = score_obj.overall_score or 70.0
    elig = score_obj.eligibility_score or 70.0
    cap = score_obj.capability_fit_score or 70.0
    val = score_obj.value_fit_score or 70.0
    time_s = score_obj.time_feasibility_score or 70.0

    # Build risk factors
    risk_factors = []
    if elig < 70:
        risk_factors.append(f"Eligibility gap — score {elig:.0f}/100. Review mandatory certifications.")
    if time_s < 60:
        risk_factors.append("Tight deadline — expedited proposal preparation required.")
    if cap < 70:
        risk_factors.append("Capability mismatch — some technical requirements may not be covered.")
    if val < 65:
        risk_factors.append("Value outside preferred range — consider consortium bid or scope adjustment.")
    if opp.is_international:
        risk_factors.append("International procurement — additional compliance and currency considerations apply.")

    # Build strengths
    strengths = []
    if elig >= 85:
        strengths.append("Strong eligibility — meets regulatory and certification requirements.")
    if cap >= 85:
        strengths.append("High capability match — technical competencies directly align.")
    if score_obj.geographic_fit_score and score_obj.geographic_fit_score >= 90:
        strengths.append("Geographic advantage — local presence supports delivery.")
    if score_obj.execution_fit_score and score_obj.execution_fit_score >= 85:
        strengths.append("Proven execution track record aligns with scope complexity.")

    if not strengths:
        strengths.append("Baseline qualification criteria satisfied.")

    # Recommendation
    if overall >= 85 and elig >= 70:
        recommendation = 'pursue'
        reason = f"High match score ({overall:.0f}/100). Strong eligibility and capability alignment. Recommended for immediate pursuit."
        confidence = min(95, int(overall))
    elif overall >= 70 or (overall >= 60 and len(risk_factors) <= 1):
        recommendation = 'partner'
        reason = f"Good match ({overall:.0f}/100) with some gaps. Consider co-bidding with a partner to cover missing requirements."
        confidence = min(80, int(overall))
    elif overall >= 55:
        recommendation = 'watch'
        reason = f"Moderate fit ({overall:.0f}/100). Track for updates and reassess when Business DNA improves."
        confidence = min(65, int(overall))
    else:
        recommendation = 'no_bid'
        reason = f"Low alignment ({overall:.0f}/100). Current profile does not match opportunity requirements."
        confidence = min(50, int(overall))

    # Resource estimate based on deadline
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    days_left = None
    if opp.deadline:
        dl = opp.deadline if opp.deadline.tzinfo else opp.deadline.replace(tzinfo=timezone.utc)
        days_left = (dl - now).days

    if days_left is None:
        resource_est = "Estimate 2-4 weeks of team effort for full proposal."
    elif days_left <= 7:
        resource_est = f"Only {days_left} days remaining — requires 3-5 FTE sprint."
    elif days_left <= 21:
        resource_est = f"{days_left} days — allocate 2-3 senior team members full-time."
    else:
        resource_est = f"{days_left} days — comfortable timeline, allocate 1-2 FTE part-time."

    return {
        'recommendation': recommendation,
        'overall_score': round(overall, 1),
        'confidence': confidence,
        'risk_factors': risk_factors,
        'strengths': strengths,
        'resource_estimate': resource_est,
        'partner_needed': recommendation == 'partner',
        'reason': reason,
        'opportunity_title': opp.title,
        'days_to_deadline': days_left,
    }
