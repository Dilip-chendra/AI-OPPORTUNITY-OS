import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal as async_session_maker, engine
from app.models import Base
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.models.application import Application
from app.models.notification import Notification
from app.core.security import get_password_hash
from app.services.ingestion_service import ingestion_service
import uuid
from datetime import datetime, timedelta, timezone

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as db:
        # 1. Primary Organization
        org_res = await db.execute(select(Organization).where(Organization.slug == "opportunity-global"))
        demo_org = org_res.scalar_one_or_none()
        if not demo_org:
            demo_org = Organization(
                id=uuid.uuid4(),
                name="Opportunity Global",
                slug="opportunity-global",
                is_demo=False,
                plan="enterprise"
            )
            db.add(demo_org)
            await db.flush()

        # Primary Business Profile - Full 8 Dimensions
        prof_res = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == demo_org.id))
        demo_profile = prof_res.scalar_one_or_none()
        if not demo_profile:
            demo_profile = BusinessProfile(
                organization_id=demo_org.id,
                company_name="Opportunity Global",
                trade_name="Opportunity Global AI",
                legal_name="Opportunity Global Technologies Inc.",
                registration_number="U72200TG2021PTC098765",
                industry="Information Technology",
                sub_industry="AI & Cloud Systems",
                country="India",
                state="Telangana",
                city="Hyderabad",
                address="T-Hub Phase 2, Madhapur, Hyderabad, 500081",
                company_size="11-50",
                technical_headcount="24",
                business_stage="Scaling",
                enterprise_classification="MSME Small",
                website="https://opportunityos.ai",
                linkedin="https://linkedin.com/company/opportunity-os",
                founded_year="2021",
                description="Specialized enterprise intelligence, cloud modernization, and computer vision systems provider for public sector and regulated commercial enterprises.",
                products_services=[
                    {"name": "GovProcure AI Engine", "category": "AI/ML Software", "description": "Automated tender discovery, compliance decomposition, and bidirectional fit scoring", "target_market": "Public Sector"},
                    {"name": "SecureGov Cloud", "category": "Cloud Infrastructure", "description": "MeitY-empaneled sovereign cloud migration, zero-trust perimeter, and container security", "target_market": "Defense & Governance"},
                    {"name": "DefenseVision Edge", "category": "Embedded AI", "description": "High-throughput edge perception for critical facility perimeter monitoring and defense logistics", "target_market": "Defense"}
                ],
                capabilities=[
                    "AI / Machine Learning",
                    "Computer Vision",
                    "Cloud Migration",
                    "Enterprise Software",
                    "DevOps & CI/CD",
                    "Data Engineering",
                    "Cybersecurity",
                    "Defense Systems",
                    "GeM Procurement"
                ],
                tech_stack=["Python", "PyTorch", "Next.js", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "AWS GovCloud"],
                certifications=[
                    "MSME / Udyam Certificate",
                    "DPIIT Recognized Startup",
                    "GeM Primary Seller Account",
                    "ISO 9001 Quality Management",
                    "ISO 27001 Security Management",
                    "CMMI Maturity Level 3+"
                ],
                registrations=["CAGE Code", "SAM.gov Active", "GeM Gold Vendor", "MSME UDYAM-TG-02-0012345"],
                previous_projects=[
                    {"title": "State Defense Portal Modernization", "client": "State Defense Department", "value": 12500000, "year": "2023", "outcome": "Delivered ahead of schedule; 99.99% uptime compliance"},
                    {"title": "Automated Smart City Video Analytics", "client": "Municipal Corporation", "value": 8500000, "year": "2022", "outcome": "Deployed across 450 edge endpoints"},
                    {"title": "Sovereign Cloud Data Pipeline", "client": "National Informatics Centre Partner", "value": 19000000, "year": "2023", "outcome": "Full STQC compliance certification achieved"}
                ],
                preferred_contract_min=1000000,
                preferred_contract_max=100000000,
                preferred_currency="INR",
                target_markets=["Public Sector", "Defense", "Smart Cities", "Healthcare Infrastructure"],
                geographic_coverage=["India", "United States", "United Kingdom", "Southeast Asia"],
                delivery_regions=["Pan-India", "Global Remote"],
                funding_required=False,
                export_focused=True,
                consortium_open=True,
                growth_goals=["Expand public sector market share by 40%", "Secure 5 major multilateral defense contracts", "Achieve CMMI Level 5 certification"],
                onboarding_completed=True
            )
            db.add(demo_profile)
            await db.flush()
        else:
            demo_profile.company_name = "Opportunity Global"
            demo_profile.trade_name = "Opportunity Global AI"
            demo_profile.legal_name = "Opportunity Global Technologies Inc."

        # 2. Seed RBAC Persona Users for Primary Org
        roles_to_seed = [
            {"email": "dilip.madagari@gmail.com", "name": "Dilip Madagari", "role": UserRole.OWNER, "admin": True},
            {"email": "demo@demo.com", "name": "Devon Vance", "role": UserRole.OWNER, "admin": True},
            {"email": "owner@demo.com", "name": "Devon Vance", "role": UserRole.OWNER, "admin": True},
            {"email": "admin@demo.com", "name": "Alex Mercer", "role": UserRole.ADMIN, "admin": True},
            {"email": "manager@demo.com", "name": "Morgan Riley", "role": UserRole.MANAGER, "admin": False},
            {"email": "analyst@demo.com", "name": "Sam Chen", "role": UserRole.ANALYST, "admin": False},
            {"email": "member@demo.com", "name": "Jordan Taylor", "role": UserRole.MEMBER, "admin": False},
            {"email": "viewer@demo.com", "name": "Valerie Croft", "role": UserRole.VIEWER, "admin": False},
        ]

        seeded_users = {}
        for r in roles_to_seed:
            u_res = await db.execute(select(User).where(User.email == r["email"]))
            user = u_res.scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    email=r["email"],
                    full_name=r["name"],
                    hashed_password=get_password_hash("DemoPass123"),
                    organization_id=demo_org.id,
                    role=r["role"],
                    is_admin=r["admin"],
                    is_active=True
                )
                db.add(user)
                await db.flush()
            else:
                user.role = r["role"]
                user.is_admin = r["admin"]
                user.hashed_password = get_password_hash("DemoPass123")
                db.add(user)
            seeded_users[r["email"]] = user

        # 3. Seed Organization B for IDOR / Tenant Isolation verification
        org_b_res = await db.execute(select(Organization).where(Organization.slug == "apex-global"))
        org_b = org_b_res.scalar_one_or_none()
        if not org_b:
            org_b = Organization(
                id=uuid.uuid4(),
                name="Apex Global Technologies",
                slug="apex-global",
                is_demo=False,
                plan="pro"
            )
            db.add(org_b)
            await db.flush()

        u_b_res = await db.execute(select(User).where(User.email == "external@orgb.com"))
        user_b = u_b_res.scalar_one_or_none()
        if not user_b:
            user_b = User(
                id=uuid.uuid4(),
                email="external@orgb.com",
                full_name="Marcus Wright (Apex Owner)",
                hashed_password=get_password_hash("DemoPass123"),
                organization_id=org_b.id,
                role=UserRole.OWNER,
                is_admin=False,
                is_active=True
            )
            db.add(user_b)
            await db.flush()

        # 4. Seed Rich Multi-Category Opportunities across all 7 Categories
        opp_count_res = await db.execute(select(Opportunity))
        existing_opps = opp_count_res.scalars().all()
        
        all_categories_catalog = [
            # Government
            {"title": "National AI Compute Infrastructure & Cloud Hosting Tender", "org": "MeitY / NIC", "val": 150000000, "cat": "government", "type": "tender", "country": "India", "cur": "INR", "url": "https://eprocure.gov.in"},
            {"title": "AI-Powered Smart City Traffic Management System", "org": "Telangana State IT Dept", "val": 32000000, "cat": "government", "type": "tender", "country": "India", "cur": "INR", "url": "https://tender.telangana.gov.in"},
            {"title": "GeM Empanelment — Cloud Consulting & DevOps Roster", "org": "Government e-Marketplace", "val": 12000000, "cat": "government", "type": "tender", "country": "India", "cur": "INR", "url": "https://gem.gov.in"},
            
            # Funding
            {"title": "MSME Digital Transformation & Green Transition Grant Q4", "org": "Ministry of MSME", "val": 5000000, "cat": "funding", "type": "grant", "country": "India", "cur": "INR", "url": "https://msme.gov.in"},
            {"title": "DPIIT Seed Fund Innovation Challenge Round 8", "org": "Startup India / DPIIT", "val": 2500000, "cat": "funding", "type": "grant", "country": "India", "cur": "INR", "url": "https://startupindia.gov.in"},
            {"title": "Biotechnology Ignition Grant (BIG) Deep Tech Cohort", "org": "BIRAC", "val": 5000000, "cat": "funding", "type": "grant", "country": "India", "cur": "INR", "url": "https://birac.nic.in"},

            # Corporate
            {"title": "Global Cloud Migration & Enterprise ERP Modernization RFP", "org": "Tata Steel Global", "val": 35000000, "cat": "corporate", "type": "rfp", "country": "India", "cur": "INR", "url": "https://tatasteel.com"},
            {"title": "Tier-1 Enterprise Security & Data Governance Bid", "org": "Reliance Digital Industries", "val": 48000000, "cat": "corporate", "type": "rfp", "country": "India", "cur": "INR", "url": "https://ril.com"},
            {"title": "Enterprise Logistics Telemetry System RFP", "org": "Adani Logistics Ltd", "val": 22000000, "cat": "corporate", "type": "rfp", "country": "India", "cur": "INR", "url": "https://adani.com"},

            # Global
            {"title": "World Bank South Asia Digital Infrastructure & Health Interoperability", "org": "World Bank Group", "val": 160000000, "cat": "global", "type": "procurement", "country": "Global", "cur": "USD", "url": "https://projects.worldbank.org"},
            {"title": "EU Horizon Europe Collaborative AI Framework 2027", "org": "European Commission", "val": 45000000, "cat": "global", "type": "grant", "country": "Global", "cur": "EUR", "url": "https://ec.europa.eu"},
            {"title": "UN Climate Resilient Water Telemetry Network", "org": "United Nations Development Programme", "val": 85000000, "cat": "global", "type": "procurement", "country": "Global", "cur": "USD", "url": "https://undp.org"},

            # Partnerships
            {"title": "Consortium Alliance: National Highway Fiber Laying EPC", "org": "L&T Construction (Prime)", "val": 95000000, "cat": "partnerships", "type": "tender", "country": "India", "cur": "INR", "url": "https://lntecc.com"},
            {"title": "Defense Electronics Sub-Contractor Co-Bidding Call", "org": "Bharat Electronics Limited (BEL)", "val": 40000000, "cat": "partnerships", "type": "tender", "country": "India", "cur": "INR", "url": "https://bel-india.in"},

            # Innovation
            {"title": "Smart Mobility & EV Telemetry Grand Challenge", "org": "NITI Aayog / AIM", "val": 5000000, "cat": "innovation", "type": "challenge", "country": "India", "cur": "INR", "url": "https://aim.gov.in"},
            {"title": "Autonomous Drone Agriculture Inspection Challenge", "org": "ICAR", "val": 7500000, "cat": "innovation", "type": "challenge", "country": "India", "cur": "INR", "url": "https://icar.org.in"},

            # Research
            {"title": "Quantum Computing Algorithm Commercialization Grant", "org": "Dept of Science and Technology (DST)", "val": 15000000, "cat": "research", "type": "grant", "country": "India", "cur": "INR", "url": "https://dst.gov.in"},
            {"title": "IIT Madras Deep-Tech Industry Partnership Program", "org": "IIT Madras Research Park", "val": 3000000, "cat": "research", "type": "grant", "country": "India", "cur": "INR", "url": "https://respark.iitm.ac.in"},
        ]

        opps = []
        now = datetime.now(timezone.utc)
        for idx, item in enumerate(all_categories_catalog):
            ext_id = f"seed-{item['cat'][:3]}-{idx:02d}"
            existing = await db.execute(select(Opportunity).where(Opportunity.external_id == ext_id))
            opp = existing.scalar_one_or_none()
            if not opp:
                val = float(item['val'])
                opp = Opportunity(
                    id=uuid.uuid4(),
                    external_id=ext_id,
                    title=item['title'],
                    description=f"Official notice for {item['title']}. Seeking qualified vendor partners to deliver exceptional milestones and compliance.",
                    organization_name=item['org'],
                    organization_type="Public / Enterprise",
                    category=item['cat'],
                    opportunity_type=item['type'],
                    value_min=val * 0.85 if val > 0 else 0,
                    value_max=val,
                    value_display=f"₹{(val/10000000):.1f} Cr" if item['cur'] == 'INR' and val >= 10000000 else f"₹{(val/100000):.0f}L" if item['cur'] == 'INR' else f"${(val/1000000):.1f}M",
                    currency=item['cur'],
                    deadline=now + timedelta(days=14 + (idx % 20)),
                    published_at=now,
                    geography_country=item['country'],
                    geography_state='Telangana' if item['country'] == 'India' else None,
                    is_international=(item['country'] != 'India'),
                    is_verified=True,
                    verification_status='verified',
                    is_expired=False,
                    is_demo=False,  # Accessible to all users
                    requirements=['GST / Tax Filings', 'Demonstrated 2+ years experience in scope', 'Positive audited net worth'],
                    eligibility_criteria=['Commercial registered entity', 'No active debarment or legal sanctions'],
                    required_documents=['Capability Statement', 'Technical Solution Architecture', 'Audited Accounts'],
                    tags=[item['cat'], item['type'], 'verified-source'],
                    source_url=item['url']
                )
                db.add(opp)
            opps.append(opp)

        await db.commit()

        # 5. Calculate Opportunity Scores for Demo Corp
        for idx, opp in enumerate(opps):
            sc_res = await db.execute(
                select(OpportunityScore).where(
                    OpportunityScore.opportunity_id == opp.id,
                    OpportunityScore.organization_id == demo_org.id
                )
            )
            existing_sc = sc_res.scalar_one_or_none()
            if not existing_sc:
                score = OpportunityScore(
                    opportunity_id=opp.id,
                    organization_id=demo_org.id,
                    overall_score=max(60, 95 - (idx * 2)),
                    eligibility_score=95,
                    business_fit_score=92,
                    capability_fit_score=90,
                    geographic_fit_score=95,
                    value_fit_score=88,
                    time_feasibility_score=90,
                    competition_score=78,
                    execution_fit_score=92,
                    recommendation='pursue' if idx < 5 else 'review',
                    recommendation_reason=f"Strong capability fit in {opp.category} with verified credentials.",
                    is_ai_generated=True
                )
                db.add(score)

        # 6. Applications for Demo Corp across pipeline stages
        app_stages = ["draft", "in_progress", "review", "submitted"]
        for idx, stage in enumerate(app_stages):
            if idx < len(opps):
                opp = opps[idx]
                app_res = await db.execute(
                    select(Application).where(
                        Application.opportunity_id == opp.id,
                        Application.organization_id == demo_org.id
                    )
                )
                if not app_res.scalars().first():
                    demo_app = Application(
                        id=uuid.uuid4(),
                        opportunity_id=opp.id,
                        organization_id=demo_org.id,
                        title=f"{opp.title} Pursuit",
                        assigned_to=seeded_users["manager@demo.com"].id,
                        status=stage,
                        deadline=opp.deadline
                    )
                    db.add(demo_app)

        # 7. Private Application for Org B (to test IDOR rejection)
        if len(opps) > 5:
            org_b_opp = opps[5]
            app_b_res = await db.execute(
                select(Application).where(Application.organization_id == org_b.id)
            )
            if not app_b_res.scalars().first():
                org_b_app = Application(
                    id=uuid.uuid4(),
                    opportunity_id=org_b_opp.id,
                    organization_id=org_b.id,
                    title="Confidential Apex Pursuit (Org B Only)",
                    assigned_to=user_b.id,
                    status="in_progress",
                    deadline=datetime.now(timezone.utc) + timedelta(days=21)
                )
                db.add(org_b_app)

        # 8. Notifications for Demo Corp users
        for email, user_obj in seeded_users.items():
            notif_res = await db.execute(
                select(Notification).where(Notification.user_id == user_obj.id)
            )
            if not notif_res.scalars().first():
                for i in range(4):
                    notif = Notification(
                        id=uuid.uuid4(),
                        user_id=user_obj.id,
                        organization_id=demo_org.id,
                        type='match',
                        title=f"Match Alert #{i+1}: High fit opportunity",
                        body=f"New RFP matching your capabilities was cataloged with {94 - i*3}% score.",
                        is_read=False,
                        priority='high' if i == 0 else 'medium'
                    )
                    db.add(notif)

        await db.commit()
        print("[SEED SUCCESS] Multi-User RBAC, Multi-Tenant Data & All 7 Categories Seeded Successfully.")

if __name__ == "__main__":
    asyncio.run(seed_database())
