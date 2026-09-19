from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel
import uuid
from datetime import datetime, timezone

class OutcomeLearning(TimestampedModel):
    """
    Captures post-pursuit outcomes (win, loss, disqualification) along with structured
    retrospectives, root-cause categories, and reusable assets to continuously train
    and calibrate matching thresholds.
    """
    __tablename__ = "outcome_learning"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)

    # Outcome: won | lost | no_bid | disqualified | withdrawn | expired
    outcome = Column(String, nullable=False)
    award_value = Column(Numeric, nullable=True)
    currency = Column(String, default="INR")
    winner_name = Column(String, nullable=True)

    # Primary reason category for calibration
    # pricing_commercial | technical_score | certification_gap | past_experience | compliance_defect | delivery_capacity
    primary_reason_category = Column(String, nullable=True)

    detailed_retrospective = Column(Text, nullable=True)
    lessons_learned = Column(JSONB, nullable=True, default=list)  # list of strings
    reusable_artifacts = Column(JSONB, nullable=True, default=list) # [{ title, section_type, summary, doc_id }]
