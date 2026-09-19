import asyncio
from app.core.database import AsyncSessionLocal
from app.services.ingestion_service import ingestion_service

async def main():
    print("[TEST] Running live external ingestion pass...")
    async with AsyncSessionLocal() as db:
        res = await ingestion_service.ingest_batch(db, is_demo=False, limit_per_adapter=5)
        print("[TEST RESULT]", res)
        status = await ingestion_service.get_pipeline_status(db)
        print("[PIPELINE STATUS]", status)

if __name__ == "__main__":
    asyncio.run(main())
