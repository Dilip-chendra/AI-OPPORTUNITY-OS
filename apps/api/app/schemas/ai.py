from pydantic import BaseModel
import uuid
from datetime import datetime

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    model_config = {'from_attributes': True}
