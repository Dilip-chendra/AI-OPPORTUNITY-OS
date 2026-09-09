import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.compiler import compiles
from app.main import app
from app.core.database import Base, get_db

# Enable PostgreSQL JSONB and UUID types to compile cleanly on SQLite during testing
@compiles(JSONB, 'sqlite')
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

@compiles(UUID, 'sqlite')
def compile_uuid_sqlite(type_, compiler, **kw):
    return "VARCHAR(36)"

TEST_DB_URL = os.environ.get("TEST_DATABASE_URL", "sqlite+aiosqlite:///./test_opportunity_os.db")


@pytest_asyncio.fixture(scope='session')
async def test_engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
    if os.path.exists("./test_opportunity_os.db"):
        try:
            os.remove("./test_opportunity_os.db")
        except Exception:
            pass


@pytest_asyncio.fixture
async def db_session(test_engine):
    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    async def override_db():
        yield db_session
    app.dependency_overrides[get_db] = override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as c:
        yield c
    app.dependency_overrides.clear()
