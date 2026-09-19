from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.models import *  # Import all models to register with metadata
from app.routers import (
    auth, opportunities, business_profile, search, alerts,
    analytics, ai, applications, admin, health,
    evidence_vault, lifecycle, bid_decision, requirement_shredder,
    intelligence
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables (adds new tables only; does NOT alter existing tables)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Run SQLite column migrations (safely adds missing columns)
    _run_sqlite_migrations()

    # Start background ingestion scheduler (every 6 hours)
    try:
        from app.tasks.scheduler import start_scheduler
        start_scheduler()
    except ImportError:
        import logging
        logging.getLogger(__name__).warning(
            "APScheduler not installed. Background ingestion disabled. "
            "Install with: pip install apscheduler"
        )

    yield

    # Shutdown scheduler on app stop
    try:
        from app.tasks.scheduler import stop_scheduler
        stop_scheduler()
    except Exception:
        pass

    await engine.dispose()


def _run_sqlite_migrations():
    """
    SQLite ALTER TABLE migrations — safely adds columns that exist in models
    but may not exist in the physical database (create_all cannot ALTER).
    Idempotent: safe to run on every startup.
    """
    import sqlite3
    import logging
    log = logging.getLogger(__name__)

    db_url = str(settings.DATABASE_URL)
    if "sqlite" not in db_url:
        return  # Only needed for SQLite

    db_path = db_url.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")

    migrations = [
        # opportunities — Phase 2 additions
        ("opportunities", "signal_type", "ALTER TABLE opportunities ADD COLUMN signal_type VARCHAR"),
        ("opportunities", "source_health", "ALTER TABLE opportunities ADD COLUMN source_health VARCHAR DEFAULT 'good'"),
        ("opportunities", "data_completeness_score", "ALTER TABLE opportunities ADD COLUMN data_completeness_score FLOAT DEFAULT 0.8"),
        ("opportunities", "change_fingerprint", "ALTER TABLE opportunities ADD COLUMN change_fingerprint VARCHAR"),
        ("opportunities", "last_change_detected_at", "ALTER TABLE opportunities ADD COLUMN last_change_detected_at DATETIME"),
        ("opportunities", "opportunity_family_id", "ALTER TABLE opportunities ADD COLUMN opportunity_family_id VARCHAR"),
        # applications — Phase 2/3 additions
        ("applications", "lifecycle_thread", "ALTER TABLE applications ADD COLUMN lifecycle_thread JSON"),
        ("applications", "lifecycle_stage", "ALTER TABLE applications ADD COLUMN lifecycle_stage VARCHAR DEFAULT 'discovery'"),
        ("applications", "bid_decision", "ALTER TABLE applications ADD COLUMN bid_decision VARCHAR"),
        ("applications", "bid_reason", "ALTER TABLE applications ADD COLUMN bid_reason TEXT"),
        ("applications", "bid_decided_at", "ALTER TABLE applications ADD COLUMN bid_decided_at DATETIME"),
        ("applications", "deadline_plan", "ALTER TABLE applications ADD COLUMN deadline_plan JSON"),
        ("applications", "submission_checklist", "ALTER TABLE applications ADD COLUMN submission_checklist JSON"),
        ("applications", "compliance_matrix", "ALTER TABLE applications ADD COLUMN compliance_matrix JSON"),
        ("applications", "extracted_requirements", "ALTER TABLE applications ADD COLUMN extracted_requirements JSON"),
    ]

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for table, col, sql in migrations:
            cur.execute(f"PRAGMA table_info({table})")
            existing = {r[1] for r in cur.fetchall()}
            if col not in existing:
                cur.execute(sql)
                conn.commit()
                log.info(f"[Migration] Added column {table}.{col}")
        conn.close()
    except Exception as e:
        log.warning(f"[Migration] Warning: {e}")

app = FastAPI(
    title='OpportunityOS API',
    description='Business Opportunity Operating System — Discover, Qualify, Pursue, Win',
    version='2.0.0',
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

# Core routes
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

# OpportunityOS 2.0 routes
app.include_router(evidence_vault.router, prefix='/evidence', tags=['evidence-vault'])
app.include_router(lifecycle.router, prefix='/lifecycle', tags=['lifecycle'])
app.include_router(bid_decision.router, prefix='/bid-decision', tags=['bid-decision'])
app.include_router(requirement_shredder.router, prefix='/shredder', tags=['requirement-shredder'])
app.include_router(intelligence.router, prefix='/intelligence', tags=['intelligence'])

# Legacy compat route
app.add_api_route('/recommendations', opportunities.get_recommendations, methods=['GET'], tags=['opportunities'])
