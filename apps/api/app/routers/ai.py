from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.ai_conversation import AIConversation
from app.models.business_profile import BusinessProfile
from app.schemas.ai import ChatRequest, ChatResponse, ConversationResponse
from app.services.ai_service import ai_service
from typing import List
import uuid

router = APIRouter()

@router.post('/chat', response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    # Fetch user context
    prof_result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
    profile = prof_result.scalar_one_or_none()
    
    context = {
        'org_name': org.name,
        'industry': profile.industry if profile else 'Unknown',
        'location': profile.country if profile else 'Unknown',
        'capabilities': []  # Future enhancement
    }
    
    response = await ai_service.chat(data.message, [], context)
    return ChatResponse(response=response)

@router.get('/conversations', response_model=List[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()

@router.get('/conversations/{id}')
async def get_conversation(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.id == id, AIConversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv
