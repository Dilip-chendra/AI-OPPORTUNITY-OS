from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class EvidenceDocument(TimestampedModel):
    """
    Reusable compliance evidence documents stored per organization.
    Used by the Evidence Vault and linkable to Compliance Autopilot matrices.
    """
    __tablename__ = "evidence_documents"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    document_type = Column(String, nullable=False, default="certificate")
    # document_type: certificate | registration | financial | legal | technical | reference | other

    file_url = Column(String, nullable=True)        # URL/path once uploaded
    file_path = Column(String, nullable=True)        # local disk path

    expiry_date = Column(DateTime(timezone=True), nullable=True)
    is_expired = Column(Boolean, default=False)

    tags = Column(JSONB, nullable=True)              # list of string tags
    used_in_applications = Column(JSONB, nullable=True)  # list of application_ids this doc is linked to

    notes = Column(Text, nullable=True)
