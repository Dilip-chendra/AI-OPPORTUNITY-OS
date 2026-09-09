from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class OpportunityScoreEmbedded(BaseModel):
    overall_score: float
    recommendation: Optional[str] = None
    recommendation_reason: Optional[str] = None
    eligibility_score: Optional[float] = None
    business_fit_score: Optional[float] = None
    capability_fit_score: Optional[float] = None
    geographic_fit_score: Optional[float] = None
    value_fit_score: Optional[float] = None
    time_feasibility_score: Optional[float] = None
    competition_score: Optional[float] = None
    execution_fit_score: Optional[float] = None
    model_config = {'from_attributes': True}


class OpportunityResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    category: Optional[str] = None
    opportunity_type: Optional[str] = None
    sub_category: Optional[str] = None
    value_min: Optional[float] = None
    value_max: Optional[float] = None
    value_display: Optional[str] = None
    currency: Optional[str] = 'INR'
    deadline: Optional[datetime] = None
    published_at: Optional[datetime] = None
    geography_country: Optional[str] = None
    geography_state: Optional[str] = None
    geography_city: Optional[str] = None
    is_international: Optional[bool] = False
    source_url: Optional[str] = None
    is_verified: Optional[bool] = False
    verification_status: Optional[str] = None
    is_expired: Optional[bool] = False
    is_demo: Optional[bool] = False
    requirements: Optional[List[str]] = None
    eligibility_criteria: Optional[List[str]] = None
    required_documents: Optional[List[str]] = None
    evaluation_criteria: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    industry_tags: Optional[List[str]] = None
    technology_tags: Optional[List[str]] = None
    view_count: Optional[int] = 0
    save_count: Optional[int] = 0
    created_at: datetime
    score: Optional[OpportunityScoreEmbedded] = None
    model_config = {'from_attributes': True}


class OpportunityListItem(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    organization_name: Optional[str] = None
    category: Optional[str] = None
    opportunity_type: Optional[str] = None
    value_min: Optional[float] = None
    value_max: Optional[float] = None
    value_display: Optional[str] = None
    currency: Optional[str] = 'INR'
    deadline: Optional[datetime] = None
    geography_country: Optional[str] = None
    geography_state: Optional[str] = None
    geography_city: Optional[str] = None
    is_verified: Optional[bool] = False
    is_expired: Optional[bool] = False
    is_demo: Optional[bool] = False
    source_url: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: datetime
    score: Optional[OpportunityScoreEmbedded] = None
    model_config = {'from_attributes': True}


class OpportunityFilter(BaseModel):
    category: Optional[str] = None
    opportunity_type: Optional[str] = None
    search: Optional[str] = None
    geography_country: Optional[str] = None
    value_min: Optional[float] = None
    value_max: Optional[float] = None
    page: Optional[int] = 1
    page_size: Optional[int] = 20
    sort_by: Optional[str] = 'created_at'
    sort_order: Optional[str] = 'desc'
