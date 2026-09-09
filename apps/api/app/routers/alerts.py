from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.schemas.common import MessageResponse, PaginatedResponse
import uuid

router = APIRouter()

@router.get('/', response_model=PaginatedResponse[NotificationResponse])
async def get_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc())
    offset = (page - 1) * page_size
    
    # count
    from sqlalchemy import func
    count_q = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0
    
    # fetch
    result = await db.execute(query.offset(offset).limit(page_size))
    notifications = result.scalars().all()
    
    return {
        'data': notifications,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'has_next': page * page_size < total,
        'has_prev': page > 1
    }

@router.post('/{id}/read', response_model=MessageResponse)
async def mark_read(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Notification).where(Notification.id == id, Notification.user_id == current_user.id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.commit()
    return MessageResponse(message="Marked as read", success=True)

@router.post('/read-all', response_model=MessageResponse)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(Notification).where(Notification.user_id == current_user.id).values(is_read=True)
    )
    await db.commit()
    return MessageResponse(message="All marked as read", success=True)
