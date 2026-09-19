from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, and_

from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.application import Application
from app.models.decision_journal import DecisionJournal
from app.services.scoring_service import scoring_engine
from app.services.business_context_service import business_context_service

logger = logging.getLogger(__name__)

def _normalize_datetime(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

class DecisionService:
    """
    Decision Center Service (OpportunityOS 3.0).
    Provides structured Bid/No-Bid analysis, immutable Decision Journaling,
    and multi-pursuit Portfolio Capacity Optimization.
    """

    async def evaluate_bid_readiness(
        self,
        org_id: uuid.UUID,
        opportunity_id: uuid.UUID,
        user_inputs: Optional[Dict[str, Any]],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Calculates multi-dimensional Bid/No-Bid readiness matrix combining
        Hard Gates, Soft Alignment, Economic ROI, and Portfolio Capacity impact.
        """
        user_inputs = user_inputs or {}

        # Fetch Opportunity
        opp_res = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id))
        opp = opp_res.scalar_one_or_none()
        if not opp:
            return {"error": "Opportunity not found"}

        # Fetch Business Profile
        profile_res = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org_id))
        profile = profile_res.scalar_one_or_none()

        # 1. Hard Gates & Soft Signals Evaluation
        hard_gates = scoring_engine.evaluate_hard_gates(profile, opp)
        score = scoring_engine.compute_scores(profile, opp, org_id)

        # 2. Economic Evaluation
        contract_val = float(opp.value_max or opp.value_min or 5000000.0)
        target_margin_pct = float(user_inputs.get("margin_pct", 25.0))
        
        # Estimate pursuit effort in person-days based on value and complexity
        if contract_val > 100000000:
            default_effort_days = 35.0
        elif contract_val > 25000000:
            default_effort_days = 20.0
        elif contract_val > 5000000:
            default_effort_days = 12.0
        else:
            default_effort_days = 6.0

        effort_days = float(user_inputs.get("effort_days", default_effort_days))
        day_rate = float(user_inputs.get("blended_day_rate", 8000.0))  # in currency
        pursuit_cost = effort_days * day_rate

        win_probability = round(min(90.0, max(10.0, score.overall_score * 0.85)), 1)
        expected_profit = contract_val * (target_margin_pct / 100.0)
        expected_value = expected_profit * (win_probability / 100.0)
        bid_roi = round(expected_value / max(pursuit_cost, 1.0), 2)

        # 3. Portfolio & Capacity Impact
        active_apps_res = await db.execute(
            select(Application)
            .where(
                Application.organization_id == org_id,
                Application.status.in_(["draft", "in_progress", "review"])
            )
        )
        active_apps = active_apps_res.scalars().all()
        active_count = len(active_apps)

        # Base company bandwidth
        team_size = profile.company_size if profile else "11-50"
        max_concurrent_bids = 8 if team_size in ["51-200", "201-500", "500+"] else (4 if team_size == "11-50" else 2)
        bandwidth_available = active_count < max_concurrent_bids
        deadline_risk = "low"
        if not bandwidth_available:
            deadline_risk = "high"
        elif active_count >= (max_concurrent_bids - 1):
            deadline_risk = "medium"

        # 4. Recommended Verdict
        if not hard_gates["all_passed"]:
            if hard_gates["unlock_strategy"]["suggested_partner_profile"]:
                verdict = "partner_needed"
                verdict_reason = f"Partnership required to clear hard gates: {hard_gates['unlock_strategy']['action']}"
            else:
                verdict = "no_bid"
                verdict_reason = f"Disqualified by hard gates: {hard_gates['gates'][0]['detail'] if hard_gates['gates'] else 'Criteria unmet'}"
        elif score.overall_score >= 75.0 and bid_roi >= 1.5:
            verdict = "pursue"
            verdict_reason = f"Strong qualification match ({score.overall_score}/100) and viable economics (ROI {bid_roi}x)."
        elif score.overall_score >= 60.0:
            verdict = "partner_needed"
            verdict_reason = f"Moderate fit ({score.overall_score}/100). Consider consortium partner to bolster technical credibility."
        elif score.overall_score >= 45.0:
            verdict = "watch"
            verdict_reason = f"Marginal fit ({score.overall_score}/100). Track buyer developments before committing resources."
        else:
            verdict = "no_bid"
            verdict_reason = f"Low fit ({score.overall_score}/100) and unfavorable bid economics."

        return {
            "opportunity_id": str(opp.id),
            "opportunity_title": opp.title,
            "category": opp.category,
            "buyer": opp.organization_name,
            "deadline": opp.deadline.isoformat() if opp.deadline else None,
            "verdict": verdict,
            "verdict_reason": verdict_reason,
            "overall_score": score.overall_score,
            "win_probability_pct": win_probability,
            "hard_gates": hard_gates,
            "economic_evaluation": {
                "contract_value": contract_val,
                "currency": opp.currency or "INR",
                "target_margin_pct": target_margin_pct,
                "estimated_effort_days": effort_days,
                "estimated_pursuit_cost": pursuit_cost,
                "expected_profit": round(expected_profit, 2),
                "risk_weighted_expected_value": round(expected_value, 2),
                "bid_roi_score": bid_roi,
            },
            "capacity_impact": {
                "active_pursuits_count": active_count,
                "max_recommended_concurrent": max_concurrent_bids,
                "bandwidth_available": bandwidth_available,
                "deadline_risk_level": deadline_risk,
                "team_bandwidth_hours": effort_days * 8.0
            },
            "strengths": [
                f"{d.replace('_', ' ').title()}: {score.score_metadata.get(d + '_notes')}"
                for d in ['capability', 'business_fit', 'eligibility']
                if score.score_metadata and score.score_metadata.get(d + '_notes')
            ][:3]
        }

    async def record_decision(
        self,
        org_id: uuid.UUID,
        user_id: Optional[uuid.UUID],
        decision_data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Commits an immutable Bid/No-Bid record to the Decision Journal.
        If 'pursue' is chosen, guarantees an active Application lifecycle record exists.
        """
        opp_id = uuid.UUID(str(decision_data["opportunity_id"]))
        decision = decision_data.get("decision", "pursue")
        rationale = decision_data.get("rationale", "Standard evaluation completed.")
        assumptions = decision_data.get("assumptions", [])
        hard_gates_status = decision_data.get("hard_gates_status", {})
        economic_evaluation = decision_data.get("economic_evaluation", {})
        capacity_impact = decision_data.get("capacity_impact", {})
        partner_requirements = decision_data.get("partner_requirements", [])

        # Create Journal Entry
        entry = DecisionJournal(
            id=uuid.uuid4(),
            organization_id=org_id,
            opportunity_id=opp_id,
            decision=decision,
            decision_owner_id=user_id,
            decided_at=datetime.now(timezone.utc),
            rationale=rationale,
            assumptions=assumptions,
            hard_gates_status=hard_gates_status,
            economic_evaluation=economic_evaluation,
            capacity_impact=capacity_impact,
            partner_requirements=partner_requirements
        )
        db.add(entry)

        # Synchronize with Application lifecycle
        app_res = await db.execute(
            select(Application).where(
                Application.organization_id == org_id,
                Application.opportunity_id == opp_id
            )
        )
        application = app_res.scalar_one_or_none()

        opp_res = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
        opp = opp_res.scalar_one_or_none()
        opp_title = opp.title if opp else "Untitled Pursuit"

        if decision == "pursue":
            if not application:
                application = Application(
                    id=uuid.uuid4(),
                    organization_id=org_id,
                    opportunity_id=opp_id,
                    title=opp_title,
                    status="in_progress",
                    lifecycle_stage="drafting",
                    bid_decision="pursue",
                    bid_reason=rationale,
                    bid_decided_at=datetime.now(timezone.utc),
                    deadline=opp.deadline if opp else None,
                    assigned_to=user_id
                )
                db.add(application)
            else:
                application.bid_decision = "pursue"
                application.bid_reason = rationale
                application.bid_decided_at = datetime.now(timezone.utc)
                if application.status in ["draft", "withdrawn"]:
                    application.status = "in_progress"
        elif application:
            application.bid_decision = decision
            application.bid_reason = rationale
            application.bid_decided_at = datetime.now(timezone.utc)
            if decision == "no_bid":
                application.status = "withdrawn"

        await db.commit()
        await db.refresh(entry)

        return {
            "id": str(entry.id),
            "opportunity_id": str(entry.opportunity_id),
            "decision": entry.decision,
            "decided_at": entry.decided_at.isoformat() if entry.decided_at else None,
            "rationale": entry.rationale,
            "application_id": str(application.id) if application else None,
            "message": f"Decision '{entry.decision}' successfully logged to institutional journal."
        }

    async def get_decision_history(
        self,
        org_id: uuid.UUID,
        limit: int = 50,
        db: AsyncSession = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves historical decisions from the immutable journal for organizational reflection.
        """
        query = (
            select(DecisionJournal, Opportunity)
            .join(Opportunity, DecisionJournal.opportunity_id == Opportunity.id, isouter=True)
            .where(DecisionJournal.organization_id == org_id)
            .order_by(desc(DecisionJournal.decided_at))
            .limit(limit)
        )
        res = await db.execute(query)
        rows = res.all()

        results = []
        for journal, opp in rows:
            results.append({
                "id": str(journal.id),
                "opportunity_id": str(journal.opportunity_id),
                "opportunity_title": opp.title if opp else "Unknown Opportunity",
                "buyer": opp.organization_name if opp else "Unknown Buyer",
                "opportunity_value": opp.value_max or opp.value_min if opp else None,
                "opportunity_deadline": opp.deadline.isoformat() if opp and opp.deadline else None,
                "decision": journal.decision,
                "decided_at": journal.decided_at.isoformat() if journal.decided_at else None,
                "rationale": journal.rationale,
                "assumptions": journal.assumptions or [],
                "hard_gates_status": journal.hard_gates_status or {},
                "economic_evaluation": journal.economic_evaluation or {},
                "capacity_impact": journal.capacity_impact or {},
                "partner_requirements": journal.partner_requirements or []
            })
        return results

    async def get_portfolio_capacity(
        self,
        org_id: uuid.UUID,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Computes the active pursuits capacity map, team workload allocations,
        and detects deadline collisions within the 30-day horizon.
        """
        # Fetch active applications
        query = (
            select(Application, Opportunity)
            .join(Opportunity, Application.opportunity_id == Opportunity.id, isouter=True)
            .where(
                Application.organization_id == org_id,
                Application.status.in_(["draft", "in_progress", "review", "submitted"])
            )
            .order_by(Application.deadline.asc().nullslast())
        )
        res = await db.execute(query)
        rows = res.all()

        # Fetch org profile for size
        prof_res = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org_id))
        profile = prof_res.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        timeline_items = []
        total_estimated_hours = 0.0

        for app, opp in rows:
            deadline = app.deadline or (opp.deadline if opp else None)
            deadline_norm = _normalize_datetime(deadline)
            days_remaining = None
            if deadline_norm:
                days_remaining = max(0, int((deadline_norm - now).total_seconds() // 86400))

            # Estimate hours based on contract scale
            val = float(opp.value_max or opp.value_min or 5000000.0) if opp else 5000000.0
            est_hours = 160.0 if val > 50000000 else (80.0 if val > 10000000 else 40.0)
            total_estimated_hours += est_hours

            timeline_items.append({
                "application_id": str(app.id),
                "opportunity_id": str(opp.id) if opp else None,
                "title": app.title or (opp.title if opp else "Active Pursuit"),
                "buyer": opp.organization_name if opp else "Unknown",
                "status": app.status,
                "lifecycle_stage": app.lifecycle_stage or "drafting",
                "deadline": deadline_norm.isoformat() if deadline_norm else None,
                "days_remaining": days_remaining,
                "estimated_effort_hours": est_hours,
                "value": val
            })

        # Detect deadline collisions (pursuits within 3 days of each other)
        collisions = []
        valid_deadlines = [item for item in timeline_items if item["deadline"] is not None]
        for i in range(len(valid_deadlines)):
            for j in range(i + 1, len(valid_deadlines)):
                d1 = datetime.fromisoformat(valid_deadlines[i]["deadline"])
                d2 = datetime.fromisoformat(valid_deadlines[j]["deadline"])
                diff_days = abs((d1 - d2).total_seconds()) / 86400.0
                if diff_days <= 3.0:
                    collisions.append({
                        "pursuit_1": valid_deadlines[i]["title"],
                        "pursuit_2": valid_deadlines[j]["title"],
                        "deadline_1": valid_deadlines[i]["deadline"],
                        "deadline_2": valid_deadlines[j]["deadline"],
                        "gap_days": round(diff_days, 1),
                        "warning": "High resource contention risk: Two proposals due within 72 hours."
                    })

        team_size = profile.company_size if profile else "11-50"
        weekly_team_capacity_hours = 320.0 if team_size in ["51-200", "201-500", "500+"] else (160.0 if team_size == "11-50" else 80.0)
        utilization_pct = round(min(150.0, (total_estimated_hours / max(weekly_team_capacity_hours * 2, 1.0)) * 100.0), 1)

        return {
            "active_pursuits_count": len(timeline_items),
            "total_estimated_hours": total_estimated_hours,
            "weekly_capacity_hours": weekly_team_capacity_hours,
            "utilization_pct": utilization_pct,
            "capacity_status": "overloaded" if utilization_pct > 100 else ("optimal" if utilization_pct > 60 else "available"),
            "collisions_count": len(collisions),
            "collisions": collisions,
            "pursuits": timeline_items
        }

decision_service = DecisionService()
