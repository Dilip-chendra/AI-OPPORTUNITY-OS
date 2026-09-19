import pytest
import uuid
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.core.security import get_password_hash, create_access_token

@pytest.mark.asyncio
async def test_rbac_and_tenant_isolation(client, db_session):
    # 1. Setup Organizations
    org_a = Organization(id=uuid.uuid4(), name="Org Alpha", slug="org-alpha", is_demo=False, plan="pro")
    org_b = Organization(id=uuid.uuid4(), name="Org Beta", slug="org-beta", is_demo=False, plan="free")
    db_session.add_all([org_a, org_b])
    await db_session.flush()

    # Setup Business Profile for Org A
    profile_a = BusinessProfile(
        organization_id=org_a.id,
        company_name="Org Alpha Tech",
        country="India",
        onboarding_completed=True
    )
    db_session.add(profile_a)

    # 2. Setup 6 RBAC Users for Org A
    roles = [
        ("owner", UserRole.OWNER, False),
        ("admin", UserRole.ADMIN, True),
        ("manager", UserRole.MANAGER, False),
        ("analyst", UserRole.ANALYST, False),
        ("member", UserRole.MEMBER, False),
        ("viewer", UserRole.VIEWER, False),
    ]

    tokens = {}
    users = {}
    for name, role, is_adm in roles:
        u = User(
            id=uuid.uuid4(),
            email=f"{name}@orga.com",
            full_name=f"User {name.title()}",
            hashed_password=get_password_hash("Secret123"),
            organization_id=org_a.id,
            role=role,
            is_admin=is_adm,
            is_active=True
        )
        db_session.add(u)
        users[name] = u
        tokens[name] = create_access_token({"sub": str(u.id)})

    # Setup User in Org B
    user_b = User(
        id=uuid.uuid4(),
        email="owner@orgb.com",
        full_name="Beta Owner",
        hashed_password=get_password_hash("Secret123"),
        organization_id=org_b.id,
        role=UserRole.OWNER,
        is_admin=False,
        is_active=True
    )
    db_session.add(user_b)
    token_b = create_access_token({"sub": str(user_b.id)})

    # Setup an Opportunity
    opp = Opportunity(
        id=uuid.uuid4(),
        title="Smart Grid Modernization RFP",
        description="Public tender for IoT power management",
        organization_name="Power Grid Corp",
        category="government",
        opportunity_type="tender",
        is_demo=False
    )
    db_session.add(opp)
    await db_session.commit()

    # --- TEST 1: Business Profile Updates (PUT /business-profile) ---
    # Allowed: owner, admin
    # Forbidden: manager, analyst, member, viewer
    for role_name in ["owner", "admin"]:
        res = await client.put(
            "/business-profile/",
            headers={"Authorization": f"Bearer {tokens[role_name]}"},
            json={"city": f"City_{role_name}"}
        )
        assert res.status_code == 200, f"Role {role_name} should update profile, got {res.status_code}"

    for role_name in ["manager", "analyst", "member", "viewer"]:
        res = await client.put(
            "/business-profile/",
            headers={"Authorization": f"Bearer {tokens[role_name]}"},
            json={"city": "Forbidden_City"}
        )
        assert res.status_code == 403, f"Role {role_name} should be blocked (403), got {res.status_code}"

    # --- TEST 2: Application Creation (POST /applications) ---
    # Allowed: owner, admin, manager, member
    # Forbidden: analyst, viewer
    for role_name in ["owner", "admin", "manager", "member"]:
        res = await client.post(
            "/applications/",
            headers={"Authorization": f"Bearer {tokens[role_name]}"},
            json={"opportunity_id": str(opp.id), "title": f"Pursuit by {role_name}"}
        )
        assert res.status_code == 200, f"Role {role_name} should create application, got {res.status_code}"

    for role_name in ["analyst", "viewer"]:
        res = await client.post(
            "/applications/",
            headers={"Authorization": f"Bearer {tokens[role_name]}"},
            json={"opportunity_id": str(opp.id), "title": f"Pursuit by {role_name}"}
        )
        assert res.status_code == 403, f"Role {role_name} should be blocked (403) from creating application, got {res.status_code}"

    # --- TEST 3: Opportunity Save / Unsave ---
    # Viewer must be blocked (403) from saving
    res_viewer = await client.post(
        f"/opportunities/{opp.id}/save",
        headers={"Authorization": f"Bearer {tokens['viewer']}"}
    )
    assert res_viewer.status_code == 403, "Viewer should be blocked (403) from saving opportunities"

    # Member is allowed to save
    res_member = await client.post(
        f"/opportunities/{opp.id}/save",
        headers={"Authorization": f"Bearer {tokens['member']}"}
    )
    assert res_member.status_code == 200, "Member should be allowed to save opportunities"

    # --- TEST 4: Cross-Tenant IDOR Protection ---
    # Org B user creates an application in Org B
    res_b = await client.post(
        "/applications/",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"opportunity_id": str(opp.id), "title": "Confidential Org B Pursuit"}
    )
    assert res_b.status_code == 200
    app_b_id = res_b.json()["id"]

    # Org A Owner attempts to GET Org B's application -> must get 404
    idor_get = await client.get(
        f"/applications/{app_b_id}",
        headers={"Authorization": f"Bearer {tokens['owner']}"}
    )
    assert idor_get.status_code == 404, f"Cross-tenant read must return 404, got {idor_get.status_code}"

    # Org A Admin attempts to PUT update Org B's application -> must get 404
    idor_put = await client.put(
        f"/applications/{app_b_id}?status=submitted",
        headers={"Authorization": f"Bearer {tokens['admin']}"}
    )
    assert idor_put.status_code == 404, f"Cross-tenant write must return 404, got {idor_put.status_code}"
