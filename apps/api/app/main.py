from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.models import *  # Import all models to register with metadata
from app.routers import auth, opportunities, business_profile, search, alerts, analytics, ai, applications, admin, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title='AI Opportunity OS API',
    description='Opportunity Intelligence & Execution Platform',
    version='1.0.0',
    lifespan=lifespan,
    docs_url='/docs',
    redoc_url='/redoc',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health.router, tags=['health'])
app.include_router(auth.router, prefix='/auth', tags=['auth'])
app.include_router(opportunities.router, prefix='/opportunities', tags=['opportunities'])
app.include_router(business_profile.router, prefix='/business-profile', tags=['business-profile'])
app.include_router(search.router, prefix='/search', tags=['search'])
app.include_router(alerts.router, prefix='/alerts', tags=['alerts'])
app.include_router(analytics.router, prefix='/analytics', tags=['analytics'])
app.include_router(ai.router, prefix='/ai', tags=['ai'])
app.include_router(applications.router, prefix='/applications', tags=['applications'])
app.include_router(admin.router, prefix='/admin', tags=['admin'])
