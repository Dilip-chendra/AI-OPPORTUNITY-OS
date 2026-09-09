import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal as async_session_maker
from app.models.user import User
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.notification import Notification
from app.core.security import get_password_hash
import uuid
from datetime import datetime, timedelta, timezone

from app.models import Base
from app.core.database import engine

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session_maker() as db:
        # Create Demo Org
        org_id = uuid.uuid4()
        org = Organization(id=org_id, name="Demo Corp", slug="demo-corp", is_demo=True, plan="free")
        db.add(org)
        
        # Create Demo User
        user_id = uuid.uuid4()
        user = User(
            id=user_id, email="demo@demo.com", full_name="Demo User", 
            hashed_password=get_password_hash("DemoPass123"),
            organization_id=org_id, role="owner", is_active=True
        )
        db.add(user)

        # Create Demo Business Profile
        from app.models.business_profile import BusinessProfile
        profile = BusinessProfile(
            organization_id=org_id,
            company_name="Demo Corp Solutions",
            industry="Information Technology",
            sub_industry="AI & Cloud Systems",
            country="India",
            state="Telangana",
            city="Hyderabad",
            company_size="11-50",
            preferred_currency="INR",
            preferred_contract_min=500000,
            preferred_contract_max=50000000,
            capabilities=["AI", "Cloud Migration", "Computer Vision", "IoT Telemetry"],
            certifications=["MSME / Udyam", "DPIIT Startup India", "ISO 9001"],
            funding_required=True,
            export_focused=True,
            onboarding_completed=True
        )
        db.add(profile)
        
        templates = [
            {"title": "AI-Powered Smart City Traffic Management System", "org": "Telangana State IT", "val": 32000000, "cat": "government", "type": "tender"},
            {"title": "National AI Centre Infrastructure Project", "org": "MeitY", "val": 150000000, "cat": "government", "type": "rfp"},
            {"title": "MSME Digital Transformation Innovation Grant Q4 2026", "org": "Ministry of MSME", "val": 2500000, "cat": "funding", "type": "grant"},
            {"title": "Startup India Seed Fund Scheme - Round 7", "org": "DPIIT", "val": 2000000, "cat": "funding", "type": "scheme"},
            {"title": "Enterprise Cloud Migration Partner Program", "org": "Infosys Digital", "val": 5000000, "cat": "corporate", "type": "corporate_rfp"},
            {"title": "EU Horizon Europe AI Research Partnership 2027", "org": "European Commission", "val": 45000000, "cat": "global", "type": "research"},
            {"title": "World Bank Digital Infrastructure Project - South Asia", "org": "World Bank", "val": 160000000, "cat": "global", "type": "procurement"},
            {"title": "Nasscom AI Startup Accelerator Cohort 8", "org": "Nasscom", "val": 500000, "cat": "startup", "type": "accelerator"},
            {"title": "IIT Bombay Deep Learning Research Collaboration", "org": "IIT Bombay", "val": 1500000, "cat": "innovation", "type": "research"},
            {"title": "GeM Empanelment - IT Consulting Services Category", "org": "GeM Portal", "val": 0, "cat": "government", "type": "vendor_registration"}
        ]
        
        opps = []
        for i in range(5):
            for t in templates:
                opp = Opportunity(
                    id=uuid.uuid4(),
                    title=f"{t['title']} {'I'*i if i>0 else ''}",
                    description=f"Detailed requirement for {t['title']}. Looking for capable partners to deliver exceptional results in this domain.",
                    organization_name=t['org'],
                    value_max=t['val'] * (1 + 0.1 * i),
                    value_min=t['val'] * 0.8 * (1 + 0.1 * i),
                    category=t['cat'],
                    opportunity_type=t['type'],
                    is_demo=True,
                    is_expired=False,
                    deadline=datetime.now(timezone.utc) + timedelta(days=7 + 14*i)
                )
                db.add(opp)
                opps.append(opp)
        
        await db.commit()
        
        # Add Opportunity Scores for top 5
        for idx, opp in enumerate(opps[:5]):
            score = OpportunityScore(
                opportunity_id=opp.id,
                organization_id=org_id,
                overall_score=95 - idx * 2,
                eligibility_score=98 - idx,
                business_fit_score=94 - idx * 2,
                capability_fit_score=92 - idx,
                geographic_fit_score=100,
                value_fit_score=90 - idx * 3,
                time_feasibility_score=88 - idx * 2,
                competition_score=75 - idx,
                execution_fit_score=92 - idx,
                recommendation='pursue' if idx < 3 else 'review',
                recommendation_reason=f"Strong capability fit in {opp.category} with active enterprise credentials.",
                is_ai_generated=True
            )
            db.add(score)
            
        # Add Notifications
        for i in range(10):
            notif = Notification(
                user_id=user_id, organization_id=org_id,
                type='match',
                title=f"New opportunity match found",
                body=f"An opportunity matched your profile with {90-i}% relevance.",
                is_read=False,
                priority='medium' if i < 3 else 'low'
            )
            db.add(notif)
            
        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_database())
