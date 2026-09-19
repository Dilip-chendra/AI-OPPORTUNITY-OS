from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class Application(TimestampedModel):
    """
    Pursuit / Application record — tracks the full lifecycle of an opportunity pursuit
    from bid decision through submission to outcome learning.
    """
    __tablename__ = "applications"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    title = Column(String, nullable=True)
    status = Column(String, default="draft")
    # status: draft | in_progress | review | submitted | won | lost | withdrawn

    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    submission_date = Column(DateTime(timezone=True), nullable=True)
    outcome = Column(String, default="pending")
    outcome_value = Column(Numeric, nullable=True)
    outcome_notes = Column(Text, nullable=True)

    # --- Opportunity Thread / Lifecycle ---
    # JSON array of { stage, timestamp, actor_id, notes }
    lifecycle_thread = Column(JSONB, nullable=True, default=list)
    # Current lifecycle stage (more granular than status)
    lifecycle_stage = Column(String, nullable=True)
    # stage: early_signal | forecast | pre_rfp | rfi | rfp | drafting | review | submitted | evaluation | award | active_contract | recompete | closed

    # --- Bid/No-Bid Decision ---
    bid_decision = Column(String, nullable=True)
    # bid_decision: pursue | no_bid | watch | partner
    bid_reason = Column(Text, nullable=True)
    bid_decided_at = Column(DateTime(timezone=True), nullable=True)

    # --- Deadline Autopilot ---
    # JSON array of { day_offset, milestone, description, status, due_date }
    deadline_plan = Column(JSONB, nullable=True)

    # --- Submission Checklist ---
    # JSON array of { task, done, assignee, due }
    submission_checklist = Column(JSONB, nullable=True)

    # --- Compliance Matrix ---
    # JSON array of { clause_id, requirement_text, status, evidence_document_id, owner, due_date, notes }
    compliance_matrix = Column(JSONB, nullable=True)

    # --- Requirement Shredder output ---
    # Extracted structured requirements from RFP text
    extracted_requirements = Column(JSONB, nullable=True)
