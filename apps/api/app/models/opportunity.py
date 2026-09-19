from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, DateTime, Integer, Text, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class Opportunity(TimestampedModel):
    __tablename__ = "opportunities"

    external_id = Column(String, index=True, nullable=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    opportunity_type = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    organization_name = Column(String, nullable=True)
    organization_type = Column(String, nullable=True)
    geography_country = Column(String, nullable=True)
    geography_state = Column(String, nullable=True)
    geography_city = Column(String, nullable=True)
    is_international = Column(Boolean, default=False)
    currency = Column(String, default="INR")
    value_min = Column(Numeric, nullable=True)
    value_max = Column(Numeric, nullable=True)
    value_display = Column(String, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    last_updated = Column(DateTime(timezone=True), nullable=True)
    source_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="unverified")
    is_expired = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    requirements = Column(JSONB, nullable=True)
    eligibility_criteria = Column(JSONB, nullable=True)
    required_documents = Column(JSONB, nullable=True)
    evaluation_criteria = Column(JSONB, nullable=True)
    tags = Column(JSONB, nullable=True)
    industry_tags = Column(JSONB, nullable=True)
    technology_tags = Column(JSONB, nullable=True)
    view_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)

    # --- Opportunity Thread: Signal Type / Lifecycle Stage ---
    # Tracks what stage this opportunity is at in the pre-RFP → active lifecycle
    signal_type = Column(String, nullable=True, default="rfp")
    # signal_type: early_signal | forecast | pre_rfp | rfi | eoi | rfp | rfq | tender | active | expired

    # --- Opportunity Health ---
    # Source-level health indicators (populated/updated by ingestion pipeline)
    source_health = Column(String, nullable=True, default="unverified")
    # source_health: verified | stale | unreachable | unverified
    data_completeness_score = Column(Float, nullable=True)  # 0-100

    # Change detection: fingerprint of key fields to detect when the opportunity changes
    change_fingerprint = Column(String, nullable=True)
    last_change_detected_at = Column(DateTime(timezone=True), nullable=True)

    # Grouping: opportunities in the same family (e.g., recompete of same contract)
    opportunity_family_id = Column(UUID(as_uuid=True), nullable=True)
