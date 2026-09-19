import pytest
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_intelligence_and_context_endpoints(client: AsyncClient, db_session):
    # Setup test org, profile, and user
    org = Organization(id=uuid.uuid4(), name="Intelligence Labs", slug="intel-labs", is_demo=False)
    db_session.add(org)
    await db_session.flush()

    profile = BusinessProfile(
        organization_id=org.id,
        company_name="Intelligence Labs",
        country="India",
        industry="Information Technology",
        company_size="11-50",
        business_stage="Growth",
        capabilities=["AI/ML", "Cloud Architecture", "Cybersecurity"],
        tech_stack=["Python", "React", "PostgreSQL", "AWS"],
        certifications=["ISO 9001"],
        onboarding_completed=True
    )
    db_session.add(profile)

    opp = Opportunity(
        id=uuid.uuid4(),
        title="Enterprise AI Gateway & Cloud Migration",
        organization_name="Ministry of Electronics",
        category="government",
        geography_country="India",
        technology_tags=["Python", "Cloud Architecture", "AI/ML"],
        requirements={"certifications": ["ISO 27001", "CMMI Level 3"]},
        value_display="₹ 2.5 Cr",
        value_max=25000000.0,
        is_verified=True
    )
    db_session.add(opp)

    admin_user = User(
        id=uuid.uuid4(),
        email="admin@intellabs.com",
        full_name="Intel Admin",
        hashed_password=get_password_hash("Pass123"),
        organization_id=org.id,
        role=UserRole.ADMIN,
        is_admin=True,
        is_active=True
    )
    db_session.add(admin_user)
    await db_session.commit()

    token = create_access_token({"sub": str(admin_user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test Business Context
    ctx_res = await client.get("/business-profile/context", headers=headers)
    assert ctx_res.status_code == 200
    ctx_data = ctx_res.json()
    assert ctx_data["company_name"] == "Intelligence Labs"
    assert "completeness" in ctx_data
    assert "readiness" in ctx_data
    assert ctx_data["version"] >= 1

    # 2. Test Completeness
    comp_res = await client.get("/business-profile/completeness", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "score" in comp_data
    assert "missing_items" in comp_data

    # 3. Test Readiness
    read_res = await client.get("/business-profile/readiness", headers=headers)
    assert read_res.status_code == 200
    read_data = read_res.json()
    assert "score" in read_data
    assert "tier" in read_data

    # 4. Test Opportunity Thread
    thread_res = await client.get(f"/intelligence/threads/{opp.id}", headers=headers)
    assert thread_res.status_code == 200
    thread_data = thread_res.json()
    assert thread_data["opportunity_id"] == str(opp.id)
    assert len(thread_data["lifecycle_events"]) >= 5

    # 5. Test Buyer 360
    buyer_res = await client.get(f"/intelligence/buyers/{opp.organization_name}", headers=headers)
    assert buyer_res.status_code == 200
    buyer_data = buyer_res.json()
    assert buyer_data["total_opportunities"] >= 1
    assert "procurement_velocity" in buyer_data

    # 6. Test Whitespace
    ws_res = await client.get("/intelligence/whitespace", headers=headers)
    assert ws_res.status_code == 200
    ws_data = ws_res.json()
    assert "uncontested_opportunities" in ws_data
    assert "underserved_buyers" in ws_data

    # 7. Test Work Queue
    wq_res = await client.get("/intelligence/work-queue", headers=headers)
    assert wq_res.status_code == 200
    wq_data = wq_res.json()
    assert "items" in wq_data
    assert "total_items" in wq_data

    # 8. Test Simulator
    sim_res = await client.post(
        "/intelligence/simulate",
        headers=headers,
        json={
            "opportunity_id": str(opp.id),
            "add_certifications": ["ISO 27001", "CMMI Level 3"],
            "partner_oem": True,
            "consortium": True
        }
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "baseline" in sim_data
    assert "simulated" in sim_data
    assert "delta" in sim_data
    assert sim_data["simulated"]["overall_score"] >= sim_data["baseline"]["overall_score"]
