import pytest
import uuid
from datetime import datetime, timezone, timedelta

from app.core.security import create_access_token
from app.models.organization import Organization
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.services.scoring_service import scoring_engine

@pytest.mark.asyncio
async def test_hard_gates_vs_soft_signals_evaluation():
    org_id = uuid.uuid4()
    profile = BusinessProfile(
        id=uuid.uuid4(),
        organization_id=org_id,
        industry="Information Technology",
        country="India",
        certifications=[],  # Missing ISO
        registrations=["MSME"],
        preferred_contract_max=10000000,
    )
    # Opportunity requiring ISO
    opp = Opportunity(
        id=uuid.uuid4(),
        title="Gov Cloud Security Infrastructure",
        description="Mandatory ISO 27001 certification required for all prime bidders.",
        category="government",
        organization_name="Ministry of Tech",
        geography_country="India",
        requirements="Mandatory ISO 27001",
        value_min=5000000,
        value_max=12000000,
        deadline=datetime.now(timezone.utc) + timedelta(days=14)
    )

    hard_gates = scoring_engine.evaluate_hard_gates(profile, opp)
    assert hard_gates["all_passed"] is False
    assert hard_gates["failed_count"] >= 1
    assert any(g["category"] == "compliance" and not g["passed"] for g in hard_gates["gates"])
    assert hard_gates["unlock_strategy"]["status"] == "PARTIAL_NEEDS_PARTNER"

    # Now verify with ISO added
    profile.certifications = ["ISO 27001"]
    hard_gates_cleared = scoring_engine.evaluate_hard_gates(profile, opp)
    assert hard_gates_cleared["all_passed"] is True
    assert hard_gates_cleared["unlock_strategy"]["status"] == "PURSUIT_READY"

@pytest.mark.asyncio
async def test_decision_and_learning_api_flow(client, db_session):
    # Setup test org, user, and opportunity in db_session
    org = Organization(id=uuid.uuid4(), name="Decision Tech Org", slug=f"dec-org-{uuid.uuid4().hex[:6]}")
    db_session.add(org)

    user = User(
        id=uuid.uuid4(),
        organization_id=org.id,
        email=f"lead_{uuid.uuid4().hex[:6]}@test.com",
        hashed_password="hash",
        full_name="Capture Lead",
        role="owner",
        is_active=True
    )
    db_session.add(user)

    profile = BusinessProfile(
        id=uuid.uuid4(),
        organization_id=org.id,
        company_name="Decision Tech",
        industry="Software & AI",
        country="India",
        capabilities=["AI", "Cloud"],
        certifications=["ISO 9001", "ISO 27001"],
        preferred_contract_max=50000000,
        company_size="11-50"
    )
    db_session.add(profile)

    opp = Opportunity(
        id=uuid.uuid4(),
        title="State AI Surveillance & Monitoring",
        description="AI surveillance and real-time alerts.",
        category="government",
        organization_name="State Police",
        geography_country="India",
        value_min=15000000,
        value_max=25000000,
        deadline=datetime.now(timezone.utc) + timedelta(days=21)
    )
    db_session.add(opp)
    await db_session.commit()

    token = create_access_token({"sub": str(user.id), "org_id": str(org.id), "role": "owner"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Evaluate Bid Readiness
    eval_resp = await client.post("/decision/evaluate", json={
        "opportunity_id": str(opp.id),
        "margin_pct": 30.0,
        "effort_days": 15.0
    }, headers=headers)
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["verdict"] in ["pursue", "partner_needed", "review"]
    assert "economic_evaluation" in eval_data
    assert eval_data["economic_evaluation"]["bid_roi_score"] > 0

    # 2. Commit Decision to Journal
    commit_resp = await client.post("/decision/commit", json={
        "opportunity_id": str(opp.id),
        "decision": "pursue",
        "rationale": "High win probability and strong alignment with state police surveillance requirements.",
        "assumptions": ["Subcontractor available for local hardware deployment"],
        "hard_gates_status": eval_data["hard_gates"],
        "economic_evaluation": eval_data["economic_evaluation"],
        "capacity_impact": eval_data["capacity_impact"]
    }, headers=headers)
    assert commit_resp.status_code == 200
    commit_data = commit_resp.json()
    assert commit_data["decision"] == "pursue"
    assert commit_data["application_id"] is not None

    # 3. Retrieve Decision Journal
    journal_resp = await client.get("/decision/journal", headers=headers)
    assert journal_resp.status_code == 200
    journal_entries = journal_resp.json()
    assert len(journal_entries) >= 1
    assert journal_entries[0]["opportunity_id"] == str(opp.id)
    assert journal_entries[0]["decision"] == "pursue"

    # 4. Get Portfolio Capacity Map
    port_resp = await client.get("/decision/portfolio", headers=headers)
    assert port_resp.status_code == 200
    port_data = port_resp.json()
    assert port_data["active_pursuits_count"] >= 1
    assert port_data["capacity_status"] in ["available", "optimal", "overloaded"]

    # 5. Record Win/Loss Retrospective in Outcome Learning
    outcome_resp = await client.post("/learning/outcomes", json={
        "opportunity_id": str(opp.id),
        "application_id": commit_data["application_id"],
        "outcome": "won",
        "award_value": 24000000.0,
        "currency": "INR",
        "primary_reason_category": "technical_score",
        "detailed_retrospective": "Exceptional edge AI demo in technical presentation secured highest evaluation marks.",
        "lessons_learned": ["Live proof-of-concept during oral defense creates decisive advantage"],
        "reusable_artifacts": [{"title": "Edge Architecture Diagram", "type": "technical_architecture", "summary": "Reusable high-concurrency video analytics schema"}]
    }, headers=headers)
    assert outcome_resp.status_code == 200
    outcome_data = outcome_resp.json()
    assert outcome_data["outcome"] == "won"

    # 6. Retrieve Learning Pulse
    pulse_resp = await client.get("/learning/pulse", headers=headers)
    assert pulse_resp.status_code == 200
    pulse_data = pulse_resp.json()
    assert pulse_data["total_outcomes"] >= 1
    assert pulse_data["win_count"] >= 1
    assert pulse_data["win_rate_pct"] == 100.0
    assert pulse_data["total_won_value"] == 24000000.0
    assert len(pulse_data["lessons_learned"]) >= 1
