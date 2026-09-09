from pydantic_settings import BaseSettings, SettingsConfigDict
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
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Admin
    ADMIN_EMAIL: str = "admin@opportunityos.com"
    ADMIN_SECRET_KEY: str = "admin-secret"
    
    # Log
    LOG_LEVEL: str = "INFO"

settings = Settings()
