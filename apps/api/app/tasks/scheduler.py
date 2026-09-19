"""
Background Ingestion Scheduler

Runs the full opportunity ingestion pipeline automatically every 6 hours.
Uses APScheduler (AsyncIOScheduler) so it integrates with FastAPI's asyncio event loop.

No manual trigger required — starts on app startup.
"""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


async def _run_ingestion():
    """The ingestion job that runs every 6 hours."""
    from app.core.database import AsyncSessionLocal
    from app.services.ingestion_service import IngestionService

    logger.info("[Scheduler] Starting scheduled ingestion run...")
    service = IngestionService()

    try:
        async with AsyncSessionLocal() as db:
            summary = await service.ingest_batch(db)
            logger.info(
                f"[Scheduler] Ingestion complete — "
                f"added={summary.get('total_persisted', 0)}, "
                f"skipped={summary.get('total_skipped', 0)}"
            )
    except Exception as e:
        logger.error(f"[Scheduler] Ingestion failed: {e}", exc_info=True)


def _on_job_event(event):
    if event.exception:
        logger.error(f"[Scheduler] Job {event.job_id} raised exception: {event.exception}")
    else:
        logger.debug(f"[Scheduler] Job {event.job_id} completed successfully.")


def start_scheduler():
    """
    Initialize and start the APScheduler background scheduler.
    Call this from FastAPI's lifespan startup event.
    Runs ingestion every 6 hours. First run starts immediately on startup.
    """
    global _scheduler

    if _scheduler is not None and _scheduler.running:
        logger.warning("[Scheduler] Already running, skipping re-init.")
        return

    _scheduler = AsyncIOScheduler(timezone='UTC')
    _scheduler.add_listener(_on_job_event, EVENT_JOB_ERROR | EVENT_JOB_EXECUTED)

    # Run every 6 hours starting immediately
    _scheduler.add_job(
        _run_ingestion,
        trigger=IntervalTrigger(hours=6),
        id='ingestion_pipeline',
        name='Opportunity Ingestion Pipeline',
        replace_existing=True,
        max_instances=1,  # Prevent concurrent runs
        coalesce=True,    # If missed, run once not multiple times
    )

    _scheduler.start()
    logger.info("[Scheduler] Background ingestion scheduler started (every 6 hours).")


def stop_scheduler():
    """Gracefully shut down the scheduler. Call from FastAPI's lifespan shutdown."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[Scheduler] Background scheduler stopped.")
