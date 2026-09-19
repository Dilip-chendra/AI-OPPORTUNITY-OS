from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.schemas.auth import SignupRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, create_password_reset_token, decode_token
from app.core.config import settings
import uuid
from datetime import timedelta

class AuthService:
    async def signup(self, db: AsyncSession, data: SignupRequest) -> dict:
        # Check duplicate email
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail='Email already registered')
        
        # Create org
        slug = data.organization_name.lower().replace(' ', '-').replace('.', '') + '-' + str(uuid.uuid4())[:8]
        org = Organization(
            name=data.organization_name,
            slug=slug,
            plan='free',
            is_demo=False
        )
        db.add(org)
        await db.flush()
        
        # Create user
        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            full_name=data.full_name,
            organization_id=org.id,
            role='owner',
            is_active=True
        )
        db.add(user)
        await db.flush()
        
        # Create empty business profile
        profile = BusinessProfile(
            organization_id=org.id,
            company_name=data.organization_name,
            country='India',
            onboarding_completed=False
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
        await db.refresh(org)
        
        tokens = self._create_tokens(str(user.id))
        return {'user': user, 'org': org, **tokens}
    
    async def login(self, db: AsyncSession, data: LoginRequest) -> dict:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail='Invalid email or password')
        if not user.is_active:
            raise HTTPException(status_code=403, detail='Account is deactivated')
        
        org_result = await db.execute(select(Organization).where(Organization.id == user.organization_id))
        org = org_result.scalar_one_or_none()
        
        tokens = self._create_tokens(str(user.id))
        return {'user': user, 'org': org, **tokens}
    
    async def forgot_password(self, db: AsyncSession, data: ForgotPasswordRequest) -> dict:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user:
            return {
                "message": "If this email address is registered, a password reset link has been prepared.",
                "reset_token": None,
                "reset_url": None
            }
        
        token = create_password_reset_token(user.email)
        reset_url = f"/reset-password?token={token}"
        return {
            "message": "Password reset link generated successfully.",
            "reset_token": token,
            "reset_url": reset_url
        }

    async def reset_password(self, db: AsyncSession, data: ResetPasswordRequest) -> dict:
        payload = decode_token(data.token)
        if not payload or payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid or expired reset token. Please request a new password reset.")
        
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Malformed reset token.")
            
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="User account is deactivated.")
            
        user.hashed_password = get_password_hash(data.new_password)
        await db.commit()
        return {"message": "Your password has been successfully updated. You can now sign in with your new password."}

    def _create_tokens(self, user_id: str) -> dict:
        access = create_access_token({'sub': user_id})
        refresh = create_refresh_token({'sub': user_id})
        return {
            'access_token': access,
            'refresh_token': refresh,
            'expires_in': settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

auth_service = AuthService()
