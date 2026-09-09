from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Union
import uuid
from datetime import datetime


class BusinessProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    company_size: Optional[str] = None
    revenue_range: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    founded_year: Optional[str] = None
    capabilities: Optional[Union[List[str], str]] = None
    certifications: Optional[Union[List[str], str]] = None
    registrations: Optional[Union[List[str], str]] = None
    preferred_contract_min: Optional[float] = None
    preferred_contract_max: Optional[float] = None
    preferred_currency: Optional[str] = 'INR'
    funding_required: Optional[bool] = False
    export_focused: Optional[bool] = False
    onboarding_completed: Optional[bool] = None


class BusinessProfileResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    company_name: str
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    company_size: Optional[str] = None
    revenue_range: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    founded_year: Optional[str] = None
    capabilities: Optional[Any] = None
    certifications: Optional[Any] = None
    registrations: Optional[Any] = None
    preferred_contract_min: Optional[float] = None
    preferred_contract_max: Optional[float] = None
    preferred_currency: Optional[str] = 'INR'
    funding_required: Optional[bool] = False
    export_focused: Optional[bool] = False
    onboarding_completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {'from_attributes': True}


class OnboardingStepRequest(BaseModel):
    step: int
    data: Dict[str, Any]
