"""
Trigger Ingestion Script to ingest expanded streams into DB and compute scores.
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.services.ingestion_service import ingestion_service
import sqlite3

async def run():
    print("Starting ingestion pass...")
    async with AsyncSessionLocal() as db:
        res = await ingestion_service.ingest_batch(db, is_demo=False, limit_per_adapter=15)
        print("Ingestion result:", res)
    
    # Check category distribution
    con = sqlite3.connect("opportunity_os.db")
    cur = con.cursor()
    counts = cur.execute("SELECT category, count(*) FROM opportunities GROUP BY category").fetchall()
    print("\nUpdated Category Counts in Database:")
    for cat, count in counts:
        print(f"  {cat}: {count}")
    total = cur.execute("SELECT count(*) FROM opportunities").fetchone()[0]
    print(f"Total opportunities: {total}")
    con.close()

if __name__ == "__main__":
    asyncio.run(run())
