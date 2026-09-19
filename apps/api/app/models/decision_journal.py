from sqlalchemy import Column, String, ForeignKey, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel
import uuid
from datetime import datetime, timezone

class DecisionJournal(TimestampedModel):
    """
    Immutable Decision Journal tracking Bid/No-Bid decisions, rationales,
    underlying assumptions, and hard-gate checks to foster institutional learning.
    """
    __tablename__ = "decision_journal"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False, index=True)
    
    # Decision: pursue | no_bid | partner_needed | watch
    decision = Column(String, nullable=False)
    decision_owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    decided_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Core qualitative justification
    rationale = Column(Text, nullable=False)
    assumptions = Column(JSONB, nullable=True, default=list)  # list of strings

    # Audit snapshot of hard gate and fit evaluations
    hard_gates_status = Column(JSONB, nullable=True)  # { all_passed: bool, gates: [...] }
    economic_evaluation = Column(JSONB, nullable=True) # { expected_contract_val, margin_est, effort_days, roi_score }
    capacity_impact = Column(JSONB, nullable=True)     # { team_bandwidth_hours, deadline_risk_level }
    partner_requirements = Column(JSONB, nullable=True) # list of missing capabilities/certs
