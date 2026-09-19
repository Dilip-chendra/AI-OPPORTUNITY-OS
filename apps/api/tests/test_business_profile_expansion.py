import pytest
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.core.security import get_password_hash, create_access_token
from sqlalchemy import select

@pytest.mark.asyncio
async def test_business_profile_8_dimensions_and_documents(client: AsyncClient, db_session):
    # 1. Setup Org and Users
    org = Organization(id=uuid.uuid4(), name="Dimension Corp", slug="dimension-corp", is_demo=False)
    db_session.add(org)
    await db_session.flush()

    profile = BusinessProfile(
        organization_id=org.id,
        company_name="Dimension Corp",
        country="India",
        onboarding_completed=False
    )
    db_session.add(profile)

    # Admin User
    admin = User(
        id=uuid.uuid4(),
        email="admin@dimension.com",
        full_name="Admin Dimension",
        hashed_password=get_password_hash("Pass123"),
        organization_id=org.id,
        role=UserRole.ADMIN,
        is_admin=True,
        is_active=True
    )
    # Viewer User
    viewer = User(
        id=uuid.uuid4(),
        email="viewer@dimension.com",
        full_name="Viewer Dimension",
        hashed_password=get_password_hash("Pass123"),
        organization_id=org.id,
        role=UserRole.VIEWER,
        is_admin=False,
        is_active=True
    )
    db_session.add_all([admin, viewer])
    await db_session.commit()

    admin_token = create_access_token({"sub": str(admin.id)})
    viewer_token = create_access_token({"sub": str(viewer.id)})

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

    # 2. Test Viewer cannot mutate profile (403)
    put_viewer = await client.put(
        "/business-profile",
        json={"company_name": "Hacked Name"},
        headers=viewer_headers
    )
    assert put_viewer.status_code == 403

    # 3. Test Admin updates 8 dimensions
    update_payload = {
        "company_name": "Dimension Technologies Ltd",
        "legal_name": "Dimension Technologies Private Limited",
        "trade_name": "Dimension AI",
        "registration_number": "U72200TG2022PTC111111",
        "industry": "Information Technology",
        "sub_industry": "Enterprise Software",
        "country": "India",
        "state": "Telangana",
        "city": "Hyderabad",
        "company_size": "51-200",
        "enterprise_classification": "MSME Medium",
        "capabilities": ["AI / Machine Learning", "Cloud Migration", "Kubernetes"],
        "tech_stack": ["Python", "React", "PostgreSQL"],
        "certifications": ["ISO 9001 Quality Management", "MSME / Udyam Certificate"],
        "previous_projects": [
            {
                "title": "National Telemetry Cloud",
                "client": "Ministry of Transport",
                "value": 45000000,
                "year": "2024",
                "description": "Cloud telemetry data pipeline."
            }
        ],
        "preferred_contract_min": 1000000,
        "preferred_contract_max": 80000000,
        "preferred_currency": "INR",
        "funding_required": True,
        "export_focused": True,
        "consortium_open": True,
        "onboarding_completed": True
    }

    put_admin = await client.put("/business-profile", json=update_payload, headers=admin_headers)
    assert put_admin.status_code == 200
    res_data = put_admin.json()
    assert res_data["company_name"] == "Dimension Technologies Ltd"
    assert res_data["legal_name"] == "Dimension Technologies Private Limited"
    assert res_data["enterprise_classification"] == "MSME Medium"
    assert "AI / Machine Learning" in res_data["capabilities"]
    assert "ISO 9001 Quality Management" in res_data["certifications"]
    assert len(res_data["previous_projects"]) == 1

    # 4. Test Add Document endpoint
    doc_payload = {
        "title": "ISO 27001 Security Clearance Certificate",
        "document_type": "certification",
        "file_url": "https://example.com/certs/iso27001.pdf"
    }
    doc_res = await client.post("/business-profile/documents", json=doc_payload, headers=admin_headers)
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    assert len(doc_data["documents"]) >= 1
    doc_id = doc_data["documents"][-1]["id"]

    # 5. Test Remove Document endpoint
    del_res = await client.delete(f"/business-profile/documents/{doc_id}", headers=admin_headers)
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert all(d["id"] != doc_id for d in (del_data["documents"] or []))
