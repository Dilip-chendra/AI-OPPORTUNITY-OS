from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TimestampedModel

class Application(TimestampedModel):
    __tablename__ = "applications"
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    title = Column(String, nullable=True)
    status = Column(String, default="draft")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    submission_date = Column(DateTime(timezone=True), nullable=True)
    outcome = Column(String, default="pending")
    outcome_value = Column(Numeric, nullable=True)
    outcome_notes = Column(Text, nullable=True)
