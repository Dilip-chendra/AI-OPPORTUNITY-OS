from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel
import uuid

class BusinessProfileVersion(TimestampedModel):
    __tablename__ = "business_profile_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    version = Column(Integer, nullable=False, default=1)
    changed_fields = Column(JSONB, nullable=True)  # List of field names that changed
    diff = Column(JSONB, nullable=True)  # Dict of { field: { "old": ..., "new": ... } }
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason = Column(String, nullable=True)
    snapshot = Column(JSONB, nullable=False)  # Full profile state at this version
    impact_summary = Column(JSONB, nullable=True)  # { "re_evaluated": 180, "score_improved": 24, "newly_eligible": 5 }
