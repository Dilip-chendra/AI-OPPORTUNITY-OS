from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TimestampedModel

class UserRole:
    OWNER = 'owner'
    ADMIN = 'admin'
    MANAGER = 'manager'
    ANALYST = 'analyst'
    MEMBER = 'member'
    VIEWER = 'viewer'

    ALL = {OWNER, ADMIN, MANAGER, ANALYST, MEMBER, VIEWER}

class User(TimestampedModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    role = Column(String, default=UserRole.MEMBER)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    email_verified = Column(Boolean, default=False)

