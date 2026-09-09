from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str = 'match'
    title: str
    body: Optional[str] = None
    opportunity_id: Optional[uuid.UUID] = None
    is_read: bool = False
    priority: Optional[str] = 'low'
    created_at: datetime
    model_config = {'from_attributes': True}
