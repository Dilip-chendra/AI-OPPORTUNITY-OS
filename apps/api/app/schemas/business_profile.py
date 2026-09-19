from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union
import uuid
from datetime import datetime


class ProductServiceItem(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    target_market: Optional[str] = None


class PastProjectItem(BaseModel):
    title: str
    client: Optional[str] = None
    value: Optional[float] = None
    year: Optional[str] = None
    description: Optional[str] = None


class DocumentMetadata(BaseModel):
    id: Optional[str] = None
    title: str
    document_type: str  # 'capability_statement' | 'financial' | 'certification' | 'case_study' | 'other'
    file_url: Optional[str] = None
    uploaded_at: Optional[str] = None


class BusinessProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    trade_name: Optional[str] = None
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    founded_year: Optional[str] = None

    company_size: Optional[str] = None
    technical_headcount: Optional[str] = None
    business_stage: Optional[str] = None
    enterprise_classification: Optional[str] = None
    revenue_range: Optional[str] = None

    # Accept list of dicts OR list of strings (frontend may send either)
    products_services: Optional[Union[List[Any], str]] = None
    capabilities: Optional[Union[List[str], str]] = None
    tech_stack: Optional[Union[List[str], str]] = None

    certifications: Optional[Union[List[Any], str]] = None
    registrations: Optional[Union[List[str], str]] = None

    previous_projects: Optional[Union[List[Any], str]] = None

    preferred_contract_min: Optional[float] = None
    preferred_contract_max: Optional[float] = None
    preferred_currency: Optional[str] = 'INR'
    target_markets: Optional[Union[List[str], str]] = None
    geographic_coverage: Optional[Union[List[str], str]] = None
    delivery_regions: Optional[Union[List[str], str]] = None
    funding_required: Optional[bool] = False
    export_focused: Optional[bool] = False
    consortium_open: Optional[bool] = True
    # Accept string OR list of strings for growth_goals
    growth_goals: Optional[Union[List[str], str]] = None

    documents: Optional[Union[List[Any], str]] = None
    onboarding_completed: Optional[bool] = None


class BusinessProfileResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    company_name: str
    trade_name: Optional[str] = None
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    founded_year: Optional[str] = None

    company_size: Optional[str] = None
    technical_headcount: Optional[str] = None
    business_stage: Optional[str] = None
    enterprise_classification: Optional[str] = None
    revenue_range: Optional[str] = None

    products_services: Optional[Any] = None
    capabilities: Optional[Any] = None
    tech_stack: Optional[Any] = None
    certifications: Optional[Any] = None
    registrations: Optional[Any] = None
    previous_projects: Optional[Any] = None

    preferred_contract_min: Optional[float] = None
    preferred_contract_max: Optional[float] = None
    preferred_currency: Optional[str] = 'INR'
    target_markets: Optional[Any] = None
    geographic_coverage: Optional[Any] = None
    delivery_regions: Optional[Any] = None
    funding_required: Optional[bool] = False
    export_focused: Optional[bool] = False
    consortium_open: Optional[bool] = True
    growth_goals: Optional[Any] = None

    documents: Optional[Any] = None
    onboarding_completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {'from_attributes': True}


class OnboardingStepRequest(BaseModel):
    step: int
    data: Dict[str, Any]


class BusinessProfileVersionResponse(BaseModel):
    id: str
    version: int
    changed_fields: Optional[List[str]] = None
    diff: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    impact_summary: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    model_config = {'from_attributes': True}


class CompletenessResponse(BaseModel):
    score: int
    is_complete: bool
    passed_count: int
    total_checks: int
    missing_items: List[Dict[str, Any]]


class ReadinessResponse(BaseModel):
    score: int
    tier: str
    gaps_count: int
    gaps: List[Dict[str, Any]]


class DNAImpactResponse(BaseModel):
    re_evaluated: int
    score_improved: int
    score_decreased: int
    newly_eligible: int
    high_relevance_count: int
    timestamp: str
    trigger_reason: str


class BusinessContextResponse(BaseModel):
    organization_id: str
    company_name: str
    trade_name: Optional[str] = None
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    founded_year: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    country: str = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    industry: str
    sub_industry: Optional[str] = None
    company_size: str
    technical_headcount: str
    business_stage: str
    enterprise_classification: str
    products_services: List[Any] = []
    capabilities: List[str] = []
    tech_stack: List[str] = []
    certifications: List[str] = []
    previous_projects: List[Any] = []
    preferred_contract_min: float = 0.0
    preferred_contract_max: float = 0.0
    preferred_currency: str = "INR"
    target_markets: List[str] = []
    geographic_coverage: List[str] = []
    documents: List[Any] = []
    version: int = 1
    last_updated: str
    completeness: CompletenessResponse
    readiness: ReadinessResponse
