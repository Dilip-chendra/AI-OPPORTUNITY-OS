from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.models.opportunity import Opportunity
from app.models.application import Application
from app.models.outcome_learning import OutcomeLearning
from app.models.business_profile import BusinessProfile

logger = logging.getLogger(__name__)

class LearningService:
    """
    Outcome Intelligence & Learning Loop Service (OpportunityOS 3.0).
    Answers: 'What are we learning?'
    Captures post-pursuit retrospectives, win/loss telemetry, recurring blockers,
    and indexes reusable artifacts to compound organizational advantage.
    """

    async def record_outcome(
        self,
        org_id: uuid.UUID,
        outcome_data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Records a post-pursuit retrospective and updates the corresponding application lifecycle.
        """
        opp_id = uuid.UUID(str(outcome_data["opportunity_id"]))
        app_id_raw = outcome_data.get("application_id")
        app_id = uuid.UUID(str(app_id_raw)) if app_id_raw else None

        outcome = outcome_data.get("outcome", "lost")
        award_val = float(outcome_data["award_value"]) if outcome_data.get("award_value") is not None else None
        winner_name = outcome_data.get("winner_name")
        primary_reason = outcome_data.get("primary_reason_category", "pricing_commercial")
        retrospective = outcome_data.get("detailed_retrospective", "")
        lessons = outcome_data.get("lessons_learned", [])
        artifacts = outcome_data.get("reusable_artifacts", [])

        # Create OutcomeLearning
        entry = OutcomeLearning(
            id=uuid.uuid4(),
            organization_id=org_id,
            opportunity_id=opp_id,
            application_id=app_id,
            outcome=outcome,
            award_value=award_val,
            currency=outcome_data.get("currency", "INR"),
            winner_name=winner_name,
            primary_reason_category=primary_reason,
            detailed_retrospective=retrospective,
            lessons_learned=lessons,
            reusable_artifacts=artifacts
        )
        db.add(entry)

        # Update Application record if it exists
        application = None
        if app_id:
            app_res = await db.execute(select(Application).where(Application.id == app_id, Application.organization_id == org_id))
            application = app_res.scalar_one_or_none()
        else:
            app_res = await db.execute(select(Application).where(Application.opportunity_id == opp_id, Application.organization_id == org_id))
            application = app_res.scalar_one_or_none()

        if application:
            if outcome == "won":
                application.status = "won"
                application.outcome = "won"
                application.outcome_value = award_val
                application.lifecycle_stage = "award"
            elif outcome == "lost":
                application.status = "lost"
                application.outcome = "lost"
                application.outcome_value = 0
                application.lifecycle_stage = "closed"
            elif outcome == "disqualified":
                application.status = "lost"
                application.outcome = "disqualified"
                application.lifecycle_stage = "closed"
            elif outcome == "withdrawn":
                application.status = "withdrawn"
                application.outcome = "withdrawn"
                application.lifecycle_stage = "closed"
            application.outcome_notes = retrospective

        await db.commit()
        await db.refresh(entry)

        return {
            "id": str(entry.id),
            "outcome": entry.outcome,
            "primary_reason_category": entry.primary_reason_category,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
            "message": f"Retrospective outcome '{entry.outcome}' stored in organizational memory."
        }

    async def get_learning_pulse(
        self,
        org_id: uuid.UUID,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Computes the organization's win/loss calibration pulse:
        - Win rate & total value won
        - Root-cause breakdown of losses & disqualifications
        - Recurrent qualification blockers
        - Reusable artifacts repository
        """
        query = (
            select(OutcomeLearning, Opportunity)
            .join(Opportunity, OutcomeLearning.opportunity_id == Opportunity.id, isouter=True)
            .where(OutcomeLearning.organization_id == org_id)
            .order_by(desc(OutcomeLearning.created_at))
        )
        res = await db.execute(query)
        rows = res.all()

        total = len(rows)
        won_count = sum(1 for o, _ in rows if o.outcome == "won")
        lost_count = sum(1 for o, _ in rows if o.outcome == "lost")
        disqualified_count = sum(1 for o, _ in rows if o.outcome == "disqualified")
        total_won_value = sum(float(o.award_value or 0) for o, _ in rows if o.outcome == "won")

        win_rate = round((won_count / max(won_count + lost_count, 1)) * 100.0, 1) if (won_count + lost_count) > 0 else 0.0

        # Loss reason categorization
        reason_counts: Dict[str, int] = {}
        all_lessons = []
        all_artifacts = []
        recent_retrospectives = []

        for o, opp in rows:
            if o.outcome in ["lost", "disqualified"]:
                cat = o.primary_reason_category or "unspecified"
                reason_counts[cat] = reason_counts.get(cat, 0) + 1

            if o.lessons_learned and isinstance(o.lessons_learned, list):
                for lesson in o.lessons_learned:
                    all_lessons.append({
                        "lesson": lesson,
                        "outcome": o.outcome,
                        "opportunity_title": opp.title if opp else "Pursuit"
                    })

            if o.reusable_artifacts and isinstance(o.reusable_artifacts, list):
                for art in o.reusable_artifacts:
                    if isinstance(art, dict):
                        all_artifacts.append(art)
                    elif isinstance(art, str):
                        all_artifacts.append({"title": art, "type": "section", "summary": "Extracted from successful proposal"})

            if len(recent_retrospectives) < 10:
                recent_retrospectives.append({
                    "id": str(o.id),
                    "opportunity_id": str(o.opportunity_id),
                    "opportunity_title": opp.title if opp else "Unknown Tender",
                    "buyer": opp.organization_name if opp else "Buyer",
                    "outcome": o.outcome,
                    "award_value": float(o.award_value) if o.award_value else None,
                    "currency": o.currency or "INR",
                    "winner_name": o.winner_name,
                    "primary_reason_category": o.primary_reason_category,
                    "detailed_retrospective": o.detailed_retrospective,
                    "lessons_learned": o.lessons_learned or [],
                    "created_at": o.created_at.isoformat() if o.created_at else None
                })

        # Recurrent blockers identification
        recurrent_blockers = []
        blocker_labels = {
            "pricing_commercial": "Aggressive Competitor Pricing (L1 lowest-cost bids undercut margin)",
            "technical_score": "Technical Architecture Gap (Missing specific proprietary tech evaluation points)",
            "certification_gap": "Mandatory Certification Omission (Missing ISO / CMMI / Security compliance)",
            "past_experience": "Past Similar Project Value (Client required 3 prior contracts of >= 80% tender value)",
            "compliance_defect": "RFP Form Compliance Defect (Omission of specific tender annexure or bid bond)",
            "delivery_capacity": "Team Scale & Geographic Bandwidth (Lacked local on-site deployment engineers)"
        }

        for cat, count in reason_counts.items():
            recurrent_blockers.append({
                "category": cat,
                "label": blocker_labels.get(cat, cat.replace("_", " ").title()),
                "frequency": count,
                "severity": "high" if count >= 3 else ("medium" if count >= 2 else "low"),
                "remediation": self._get_blocker_remediation(cat)
            })
        recurrent_blockers.sort(key=lambda b: b["frequency"], reverse=True)

        return {
            "total_outcomes": total,
            "win_count": won_count,
            "loss_count": lost_count,
            "disqualified_count": disqualified_count,
            "win_rate_pct": win_rate,
            "total_won_value": total_won_value,
            "recurrent_blockers": recurrent_blockers,
            "loss_reason_breakdown": [
                {"category": k, "count": v, "label": blocker_labels.get(k, k.replace("_", " ").title())}
                for k, v in sorted(reason_counts.items(), key=lambda item: item[1], reverse=True)
            ],
            "lessons_learned": all_lessons[:8],
            "reusable_artifacts": all_artifacts[:12],
            "recent_retrospectives": recent_retrospectives
        }

    def _get_blocker_remediation(self, category: str) -> str:
        remediations = {
            "pricing_commercial": "Incorporate automated should-cost model & benchmark against historic L1 bidder database.",
            "technical_score": "Pre-screen RFP technical criteria using Opportunity Simulator before submitting bid.",
            "certification_gap": "Fast-track ISO/CMMI certification audit or establish standing consortium agreement.",
            "past_experience": "Form prime-subcontractor teaming agreement with certified legacy contractor.",
            "compliance_defect": "Mandate two-person checklist sign-off in Pursuit Workspace before sealed submission.",
            "delivery_capacity": "Secure pre-committed regional subcontractor bench for on-site execution."
        }
        return remediations.get(category, "Review requirements during Bid/No-Bid gate.")

learning_service = LearningService()
