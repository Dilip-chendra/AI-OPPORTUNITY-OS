import os

base_dir = r"c:\Users\admin\Downloads\Git Uploads\AI-OPPORTUNITY-OS\apps\api"

directories = [
    "app",
    "app/core",
    "app/models",
    "app/schemas",
    "app/routers",
    "app/services",
    "app/agents",
    "app/tasks",
    "app/db",
    "alembic",
    "tests",
    "scripts"
]

files = {
    "requirements.txt": """fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.7.1
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
httpx==0.27.0
redis==5.0.4
celery==5.4.0
boto3==1.34.101
google-generativeai==0.5.4
pgvector==0.2.5
slowapi==0.1.9
python-dotenv==1.0.1
pytest==8.2.0
pytest-asyncio==0.23.6
faker==24.11.0
""",
    "Dockerfile": """FROM python:3.11-slim
WORKDIR /app
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
""",
    "scripts/init_db.sql": """CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
""",
    "app/__init__.py": "",
    "app/core/__init__.py": "",
    "app/models/__init__.py": """from app.models.base import Base
from app.models.user import User
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.saved_opportunity import SavedOpportunity
from app.models.application import Application
from app.models.notification import Notification
from app.models.ai_conversation import AIConversation
from app.models.audit_log import AuditLog
""",
    "app/schemas/__init__.py": "",
    "app/routers/__init__.py": "",
    "app/services/__init__.py": "",
    "app/agents/__init__.py": "",
    "app/tasks/__init__.py": "",
    "app/db/__init__.py": "",
    "tests/__init__.py": "",
    "app/core/config.py": """from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    # App
    APP_NAME: str = "AI Opportunity OS"
    DEBUG: bool = False
    
    # Auth
    JWT_SECRET: str = "dev-secret-change-in-production-must-be-64-chars-minimum"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://opportunity_user:devpassword@localhost:5432/opportunity_os"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Storage
    STORAGE_ENDPOINT: str = "http://localhost:9000"
    STORAGE_ACCESS_KEY: str = "minioadmin"
    STORAGE_SECRET_KEY: str = "minioadmin"
    STORAGE_BUCKET: str = "opportunity-os"
    STORAGE_USE_SSL: bool = False
    
    # AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"
    AI_STUB_MODE: bool = True
    
    # Demo
    DEMO_MODE_ENABLED: bool = True
    
    # Security
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Admin
    ADMIN_EMAIL: str = "admin@opportunityos.com"
    ADMIN_SECRET_KEY: str = "admin-secret"
    
    # Log
    LOG_LEVEL: str = "INFO"

settings = Settings()
""",
    "app/core/security.py": """from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return {}
""",
    "app/core/database.py": """from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
""",
    "app/models/base.py": """import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class TimestampedModel(Base):
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
""",
    "app/models/user.py": """from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TimestampedModel

class User(TimestampedModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    role = Column(String, default='member')
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    email_verified = Column(Boolean, default=False)
""",
    "app/models/organization.py": """from sqlalchemy import Column, String, Boolean
from app.models.base import TimestampedModel

class Organization(TimestampedModel):
    __tablename__ = "organizations"
    
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False)
    plan = Column(String, default="free")
""",
    "app/models/business_profile.py": """from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class BusinessProfile(TimestampedModel):
    __tablename__ = "business_profiles"
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    sub_industry = Column(String, nullable=True)
    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    revenue_range = Column(String, nullable=True)
    description = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    founded_year = Column(String, nullable=True)
    capabilities = Column(JSONB, nullable=True)
    certifications = Column(JSONB, nullable=True)
    registrations = Column(JSONB, nullable=True)
    previous_projects = Column(JSONB, nullable=True)
    geographic_coverage = Column(JSONB, nullable=True)
    preferred_contract_min = Column(Numeric, nullable=True)
    preferred_contract_max = Column(Numeric, nullable=True)
    preferred_currency = Column(String, default="INR")
    target_markets = Column(JSONB, nullable=True)
    funding_required = Column(Boolean, default=False)
    export_focused = Column(Boolean, default=False)
    growth_goals = Column(JSONB, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
""",
    "app/models/opportunity.py": """from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
from app.models.base import TimestampedModel

class Opportunity(TimestampedModel):
    __tablename__ = "opportunities"
    
    external_id = Column(String, index=True, nullable=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    opportunity_type = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    organization_name = Column(String, nullable=True)
    organization_type = Column(String, nullable=True)
    geography_country = Column(String, nullable=True)
    geography_state = Column(String, nullable=True)
    geography_city = Column(String, nullable=True)
    is_international = Column(Boolean, default=False)
    currency = Column(String, default="INR")
    value_min = Column(Numeric, nullable=True)
    value_max = Column(Numeric, nullable=True)
    value_display = Column(String, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    last_updated = Column(DateTime(timezone=True), nullable=True)
    source_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="unverified")
    is_expired = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    requirements = Column(JSONB, nullable=True)
    eligibility_criteria = Column(JSONB, nullable=True)
    required_documents = Column(JSONB, nullable=True)
    evaluation_criteria = Column(JSONB, nullable=True)
    tags = Column(JSONB, nullable=True)
    industry_tags = Column(JSONB, nullable=True)
    technology_tags = Column(JSONB, nullable=True)
    view_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
""",
    "app/models/opportunity_score.py": """from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Float, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class OpportunityScore(TimestampedModel):
    __tablename__ = "opportunity_scores"
    
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    overall_score = Column(Float, nullable=True)
    eligibility_score = Column(Float, nullable=True)
    business_fit_score = Column(Float, nullable=True)
    capability_fit_score = Column(Float, nullable=True)
    geographic_fit_score = Column(Float, nullable=True)
    value_fit_score = Column(Float, nullable=True)
    time_feasibility_score = Column(Float, nullable=True)
    competition_score = Column(Float, nullable=True)
    execution_fit_score = Column(Float, nullable=True)
    recommendation = Column(String, nullable=True)
    recommendation_reason = Column(Text, nullable=True)
    score_metadata = Column(JSONB, nullable=True)
    is_ai_generated = Column(Boolean, default=False)
""",
    "app/models/saved_opportunity.py": """from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TimestampedModel

class SavedOpportunity(TimestampedModel):
    __tablename__ = "saved_opportunities"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    notes = Column(Text, nullable=True)
""",
    "app/models/application.py": """from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TimestampedModel

class Application(TimestampedModel):
    __tablename__ = "applications"
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    title = Column(String, nullable=True)
    status = Column(String, default="draft")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    submission_date = Column(DateTime(timezone=True), nullable=True)
    outcome = Column(String, default="pending")
    outcome_value = Column(Numeric, nullable=True)
    outcome_notes = Column(Text, nullable=True)
""",
    "app/models/notification.py": """from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TimestampedModel

class Notification(TimestampedModel):
    __tablename__ = "notifications"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    body = Column(String, nullable=True)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    priority = Column(String, default="low")
""",
    "app/models/ai_conversation.py": """from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class AIConversation(TimestampedModel):
    __tablename__ = "ai_conversations"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    title = Column(String, nullable=True)
    messages = Column(JSONB, nullable=True)
    context_opportunity_ids = Column(JSONB, nullable=True)
""",
    "app/models/audit_log.py": """from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import TimestampedModel

class AuditLog(TimestampedModel):
    __tablename__ = "audit_logs"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    changes = Column(JSONB, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
""",
    "app/schemas/auth.py": """from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization_id: str
    organization_name: str
    role: str
    is_admin: bool
    
    model_config = {"from_attributes": True}
""",
    "app/core/deps.py": """from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.organization import Organization
import uuid

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception
    
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
    
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise credentials_exception
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
""",
    "app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.routers import auth, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="AI Opportunity OS API",
    description="Opportunity Intelligence & Execution Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
# Other routers are omitted for brevity in this mock, but typically included here
""",
    "app/routers/health.py": """from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.now(timezone.utc).isoformat()}
""",
    "app/routers/auth.py": """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse
from app.core.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not implemented fully")

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Not implemented fully")

@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "organization_id": str(current_user.organization_id),
        "organization_name": "Demo Org",
        "role": current_user.role,
        "is_admin": current_user.is_admin
    }
""",
    "pytest.ini": """[pytest]
asyncio_mode = auto
testpaths = tests
"""
}

for d in directories:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully.")
