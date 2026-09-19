import asyncio
from app.core.database import engine
from app.models import Base
from app.db.seed import seed_database

async def reset():
    print("[DB RESET] Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("[DB RESET] Creating all tables with 8-dimension schema...")
        await conn.run_sync(Base.metadata.create_all)
    print("[DB RESET] Running comprehensive database seed...")
    await seed_database()
    print("[DB RESET] Complete!")

if __name__ == "__main__":
    asyncio.run(reset())
