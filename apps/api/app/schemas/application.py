from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional


class ApplicationCreate(BaseModel):
    opportunity_id: uuid.UUID
    title: Optional[str] = 'Opportunity Pursuit'
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    opportunity_id: uuid.UUID
    title: str
    status: str = 'draft'
    deadline: Optional[datetime] = None
    submission_date: Optional[datetime] = None
    outcome: Optional[str] = None
    outcome_value: Optional[float] = None
    outcome_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = {'from_attributes': True}
