from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class AIConversation(TimestampedModel):
    __tablename__ = "ai_conversations"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    title = Column(String, nullable=True)
    messages = Column(JSONB, nullable=True)
    context_opportunity_ids = Column(JSONB, nullable=True)
