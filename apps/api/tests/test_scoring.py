import pytest
import uuid
from datetime import datetime, timezone, timedelta
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.services.scoring_service import scoring_engine
from app.services.ai_service import AIService

def test_scoring_baseline_fallback():
    opp = Opportunity(
        id=uuid.uuid4(),
        title="Smart City AI Surveillance",
        description="Deployment of edge AI cameras across urban intersections.",
        category="government",
        organization_name="Municipal Corp",
        geography_country="India",
        value_min=5000000,
        value_max=10000000,
        deadline=datetime.now(timezone.utc) + timedelta(days=20)
    )
    org_id = uuid.uuid4()
    score = scoring_engine.compute_scores(None, opp, org_id)
    
    assert score.overall_score == 70.0
    assert score.recommendation == 'review'
    assert score.organization_id == org_id

def test_scoring_high_match_pursue():
    org_id = uuid.uuid4()
    profile = BusinessProfile(
        id=uuid.uuid4(),
        organization_id=org_id,
        industry="Information Technology",
        country="India",
        state="Karnataka",
        capabilities=["AI", "Computer Vision", "Cloud", "Edge Computing"],
        certifications=["ISO 9001", "ISO 27001"],
        registrations=["MSME", "Startup India", "GeM"],
        preferred_contract_min=1000000,
        preferred_contract_max=50000000,
        company_size="51-200"
    )
    opp = Opportunity(
        id=uuid.uuid4(),
        title="AI-Powered Smart Traffic Management System",
        description="Comprehensive Cloud and Computer Vision edge software integration with ISO compliance.",
        category="government",
        organization_name="Bangalore Traffic Police",
        geography_country="India",
        geography_state="Karnataka",
        requirements={"technical": "Edge computing and AI surveillance", "certifications": "ISO 9001"},
        value_min=10000000,
        value_max=25000000,
        deadline=datetime.now(timezone.utc) + timedelta(days=14)
    )
    
    score = scoring_engine.compute_scores(profile, opp, org_id)
    assert score.overall_score >= 85.0
    assert score.eligibility_score >= 90.0
    assert score.geographic_fit_score == 100.0
    assert score.recommendation == 'pursue'
    assert "High-probability match" in score.recommendation_reason

def test_scoring_failsafe_eligibility_cap():
    org_id = uuid.uuid4()
    profile = BusinessProfile(
        id=uuid.uuid4(),
        organization_id=org_id,
        industry="Retail",
        country="USA",
        certifications=[],
        registrations=[],
        capabilities=["Merchandising"]
    )
    opp = Opportunity(
        id=uuid.uuid4(),
        title="Defence Grade Encryption Protocols",
        description="Strict ISO 27001 and ISO 9001 mandatory requirement.",
        category="government",
        organization_name="Defence Ministry",
        geography_country="India",
        requirements="Mandatory ISO 27001",
        deadline=datetime.now(timezone.utc) + timedelta(days=14)
    )
    score = scoring_engine.compute_scores(profile, opp, org_id)
    assert score.overall_score <= 75.0
    assert score.geographic_fit_score <= 50.0

def test_scoring_expired_deadline_skips():
    org_id = uuid.uuid4()
    profile = BusinessProfile(
        id=uuid.uuid4(),
        organization_id=org_id,
        industry="IT",
        country="India"
    )
    opp = Opportunity(
        id=uuid.uuid4(),
        title="Expired Tender",
        description="Past deadline notice.",
        category="corporate",
        organization_name="Tata",
        deadline=datetime.now(timezone.utc) - timedelta(days=2)
    )
    score = scoring_engine.compute_scores(profile, opp, org_id)
    assert score.time_feasibility_score == 0.0
    assert score.recommendation == 'skip'

@pytest.mark.asyncio
async def test_ai_service_stub_and_proposal_drafting():
    ai = AIService(stub_mode=True)
    resp = await ai.chat("What are our highest win-rate opportunities this month?", [], {})
    assert "opportunity" in resp.lower() or "focusing" in resp.lower()
    
    proposal = await ai.draft_proposal_section(
        opp_title="AI Smart Traffic Management",
        section_type="executive_summary",
        context={"org_name": "VisionTech AI", "industry": "Computer Vision & Edge Systems"}
    )
    assert "VisionTech AI" in proposal
    assert "Executive Summary" in proposal

    matrix = await ai.generate_compliance_matrix(
        opp_title="AI Smart Traffic Management",
        requirements=["Entity must possess active ISO certification."],
        context={}
    )
    assert len(matrix) >= 1
    assert "clause_id" in matrix[0]
