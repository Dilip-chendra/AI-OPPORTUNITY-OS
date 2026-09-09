from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class BusinessProfile(TimestampedModel):
    __tablename__ = "business_profiles"
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    sub_industry = Column(String, nullable=True)
    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    revenue_range = Column(String, nullable=True)
    description = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    founded_year = Column(String, nullable=True)
    capabilities = Column(JSONB, nullable=True)
    certifications = Column(JSONB, nullable=True)
    registrations = Column(JSONB, nullable=True)
    previous_projects = Column(JSONB, nullable=True)
    geographic_coverage = Column(JSONB, nullable=True)
    preferred_contract_min = Column(Numeric, nullable=True)
    preferred_contract_max = Column(Numeric, nullable=True)
    preferred_currency = Column(String, default="INR")
    target_markets = Column(JSONB, nullable=True)
    funding_required = Column(Boolean, default=False)
    export_focused = Column(Boolean, default=False)
    growth_goals = Column(JSONB, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
