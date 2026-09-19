from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel
import uuid

class OpportunityThread(TimestampedModel):
    __tablename__ = "opportunity_threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    buyer_name = Column(String, nullable=False, index=True)
    category = Column(String, default="government", index=True)
    current_stage = Column(String, default="tender")
    primary_opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=True)
    lifecycle_events = Column(JSONB, nullable=True)
    recompete_indicators = Column(JSONB, nullable=True)
