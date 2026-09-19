import pytest
import uuid
from httpx import AsyncClient
from app.services.ingestion.base import NormalizedOpportunity, BaseSourceAdapter
from app.services.ingestion_service import ingestion_service
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.core.security import get_password_hash, create_access_token


class MockAdapter(BaseSourceAdapter):
    @property
    def name(self) -> str:
        return "mock_adapter"

    @property
    def default_category(self) -> str:
        return "government"

    async def test_connection(self) -> bool:
        return True

    async def fetch(self, limit: int = 2):
        return [
            NormalizedOpportunity(
                external_id="mock-001",
                title="Mock AI Defense Framework",
                description="Mock tender description for testing.",
                organization_name="Mock Federal Agency",
                category="government",
                opportunity_type="tender",
                value_min=100000.0,
                value_max=500000.0,
                currency="USD",
                deadline=None,
                published_at=None,
                source_url="https://example.com/mock-001"
            )
        ]


@pytest.mark.asyncio
async def test_mock_adapter_normalization(db_session):
    adapter = MockAdapter()
    assert await adapter.test_connection() is True
    opps = await adapter.fetch(limit=1)
    assert len(opps) == 1
    assert opps[0].external_id == "mock-001"
    assert opps[0].category == "government"


@pytest.mark.asyncio
async def test_pipeline_status(db_session):
    status = await ingestion_service.get_pipeline_status(db_session)
    assert status['status'] == 'healthy'
    assert 'total_opportunities_in_db' in status
    assert 'adapters' in status
    assert len(status['adapters']) >= 3


@pytest.mark.asyncio
async def test_admin_ingestion_endpoints(client: AsyncClient, db_session):
    org = Organization(id=uuid.uuid4(), name="Platform Admins", slug="platform-admins", is_demo=False)
    admin_user = User(
        id=uuid.uuid4(),
        email="platform_admin@test.com",
        full_name="Platform Admin",
        hashed_password=get_password_hash("Pass123"),
        organization_id=org.id,
        role=UserRole.ADMIN,
        is_admin=True,
        is_active=True
    )
    db_session.add_all([org, admin_user])
    await db_session.commit()

    token = create_access_token({"sub": str(admin_user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    # Status endpoint
    status_resp = await client.get("/admin/ingestion/status", headers=headers)
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert "total_opportunities_in_db" in data
    assert "adapters" in data

    # Trigger endpoint
    trigger_resp = await client.post("/admin/ingestion/trigger?limit=2", headers=headers)
    assert trigger_resp.status_code == 200
    trig_data = trigger_resp.json()
    assert "fetched" in trig_data
    assert "scores_computed" in trig_data
