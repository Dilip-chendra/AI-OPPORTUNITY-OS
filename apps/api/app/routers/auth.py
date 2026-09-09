from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import decode_token, create_access_token
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse, TokenResponse, UserResponse
from app.services.auth_service import auth_service
from app.core.config import settings
from typing import Optional
import uuid

router = APIRouter()

@router.post('/signup', response_model=AuthResponse)
async def signup(data: SignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await auth_service.signup(db, data)
    response.set_cookie('refresh_token', result['refresh_token'], httponly=True, max_age=86400*30, samesite='lax')
    org = result['org']
    return AuthResponse(
        user=UserResponse(
            id=str(result['user'].id),
            email=result['user'].email,
            full_name=result['user'].full_name,
            organization_id=str(org.id),
            organization_name=org.name,
            role=result['user'].role,
            is_admin=result['user'].is_admin
        ),
        access_token=result['access_token'],
        expires_in=result['expires_in']
    )

@router.post('/login', response_model=AuthResponse)
async def login(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await auth_service.login(db, data)
    response.set_cookie('refresh_token', result['refresh_token'], httponly=True, max_age=86400*30, samesite='lax')
    org = result['org']
    return AuthResponse(
        user=UserResponse(
            id=str(result['user'].id),
            email=result['user'].email,
            full_name=result['user'].full_name,
            organization_id=str(org.id) if org else '',
            organization_name=org.name if org else '',
            role=result['user'].role,
            is_admin=result['user'].is_admin
        ),
        access_token=result['access_token'],
        expires_in=result['expires_in']
    )

@router.post('/refresh', response_model=TokenResponse)
async def refresh_token(refresh_token: Optional[str] = Cookie(None), db: AsyncSession = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail='No refresh token')
    payload = decode_token(refresh_token)
    if not payload or payload.get('type') != 'refresh':
        raise HTTPException(status_code=401, detail='Invalid refresh token')
    user_id = payload.get('sub')
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail='User not found')
    access_token = create_access_token({'sub': str(user.id)})
    return TokenResponse(access_token=access_token, expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60)

@router.post('/logout')
async def logout(response: Response):
    response.delete_cookie('refresh_token')
    return {'message': 'Logged out successfully'}

@router.get('/me', response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org_result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    org = org_result.scalar_one_or_none()
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        organization_id=str(current_user.organization_id) if current_user.organization_id else '',
        organization_name=org.name if org else '',
        role=current_user.role,
        is_admin=current_user.is_admin
    )
