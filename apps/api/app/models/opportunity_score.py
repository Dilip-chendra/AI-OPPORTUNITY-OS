from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Float, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class OpportunityScore(TimestampedModel):
    __tablename__ = "opportunity_scores"
    
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    overall_score = Column(Float, nullable=True)
    eligibility_score = Column(Float, nullable=True)
    business_fit_score = Column(Float, nullable=True)
    capability_fit_score = Column(Float, nullable=True)
    geographic_fit_score = Column(Float, nullable=True)
    value_fit_score = Column(Float, nullable=True)
    time_feasibility_score = Column(Float, nullable=True)
    competition_score = Column(Float, nullable=True)
    execution_fit_score = Column(Float, nullable=True)
    recommendation = Column(String, nullable=True)
    recommendation_reason = Column(Text, nullable=True)
    score_metadata = Column(JSONB, nullable=True)
    is_ai_generated = Column(Boolean, default=False)
