from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class BusinessProfile(TimestampedModel):
    __tablename__ = "business_profiles"
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), unique=True, nullable=False)
    
    # 1. Company Identity & Legal Structure
    company_name = Column(String, nullable=False)
    trade_name = Column(String, nullable=True)
    legal_name = Column(String, nullable=True)
    registration_number = Column(String, nullable=True)
    founded_year = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    description = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    sub_industry = Column(String, nullable=True)

    # 2. Company Size & Stage Classification
    company_size = Column(String, nullable=True)
    technical_headcount = Column(String, nullable=True)
    business_stage = Column(String, nullable=True)
    enterprise_classification = Column(String, nullable=True)
    revenue_range = Column(String, nullable=True)

    # 3. Products & Services Catalog
    products_services = Column(JSONB, nullable=True)

    # 4. Capabilities & Tech Stack
    capabilities = Column(JSONB, nullable=True)
    tech_stack = Column(JSONB, nullable=True)

    # 5. Certifications & Compliance
    certifications = Column(JSONB, nullable=True)
    registrations = Column(JSONB, nullable=True)

    # 6. Experience & Past Projects
    previous_projects = Column(JSONB, nullable=True)

    # 7. Targets & Strategic Preferences
    preferred_contract_min = Column(Numeric, nullable=True)
    preferred_contract_max = Column(Numeric, nullable=True)
    preferred_currency = Column(String, default="INR")
    target_markets = Column(JSONB, nullable=True)
    geographic_coverage = Column(JSONB, nullable=True)
    delivery_regions = Column(JSONB, nullable=True)
    funding_required = Column(Boolean, default=False)
    export_focused = Column(Boolean, default=False)
    consortium_open = Column(Boolean, default=True)
    growth_goals = Column(JSONB, nullable=True)

    # 8. Collateral & Documents
    documents = Column(JSONB, nullable=True)

    # Onboarding lifecycle flag
    onboarding_completed = Column(Boolean, default=False)
