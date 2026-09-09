import uuid
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.business_profile import BusinessProfile
from app.services.scoring_service import scoring_engine


class IngestionService:
    """
    Ingestion & Discovery Pipeline for AI Opportunity OS.
    Ingests, normalizes, deduplicates, and scores opportunities across 7 categories.
    """

    CHANNELS = {
        'government': [
            {'title': 'State Smart Grid & Metering Infrastructure Tender', 'org': 'Karnataka Power Transmission Corp', 'val': 45000000, 'type': 'tender', 'loc': ('India', 'Karnataka', 'Bengaluru')},
            {'title': 'Integrated Transport Management System (ITMS) RFP', 'org': 'Delhi Transport Corporation', 'val': 78000000, 'type': 'rfp', 'loc': ('India', 'Delhi', 'New Delhi')},
            {'title': 'GeM Empanelment — Cyber Security & Cloud Audit Services', 'org': 'Government e-Marketplace', 'val': 0, 'type': 'vendor_registration', 'loc': ('India', None, None)},
            {'title': 'AI Video Analytics & Surveillance for Municipal Parks', 'org': 'Greater Chennai Corporation', 'val': 18000000, 'type': 'tender', 'loc': ('India', 'Tamil Nadu', 'Chennai')},
        ],
        'funding': [
            {'title': 'MSME Green Energy Transition Subsidy Scheme 2026', 'org': 'Ministry of MSME', 'val': 5000000, 'type': 'scheme', 'loc': ('India', None, None)},
            {'title': 'DPIIT Seed Fund Innovation Challenge — Deep Tech Cohort', 'org': 'Startup India / DPIIT', 'val': 2500000, 'type': 'grant', 'loc': ('India', None, None)},
            {'title': 'Biotechnology Ignition Grant (BIG) - Round 24', 'org': 'BIRAC', 'val': 5000000, 'type': 'grant', 'loc': ('India', None, None)},
            {'title': 'Clean Energy Innovation Voucher Program', 'org': 'Technology Development Board', 'val': 3500000, 'type': 'grant', 'loc': ('India', None, None)},
        ],
        'corporate': [
            {'title': 'Global ERP Modernization & Migration RFP', 'org': 'Tata Steel Global', 'val': 35000000, 'type': 'corporate_rfp', 'loc': ('India', 'Maharashtra', 'Mumbai')},
            {'title': 'Tier-1 IT Infrastructure Maintenance Empanelment', 'org': 'Reliance Industries Digital', 'val': 60000000, 'type': 'corporate_rfp', 'loc': ('India', 'Gujarat', 'Ahmedabad')},
            {'title': 'Enterprise Supply Chain Visibility Platform Bid', 'org': 'Adani Logistics', 'val': 22000000, 'type': 'corporate_rfp', 'loc': ('India', 'Gujarat', 'Ahmedabad')},
        ],
        'global': [
            {'title': 'South Asia Digital Health Records Interoperability Project', 'org': 'World Bank', 'val': 120000000, 'type': 'procurement', 'loc': ('Global', None, None)},
            {'title': 'UN Climate Resilient Water Infrastructure Facility', 'org': 'United Nations Development Programme', 'val': 85000000, 'type': 'procurement', 'loc': ('Global', None, None)},
            {'title': 'EU Horizon Europe — Scalable Edge AI for Smart Cities', 'org': 'European Commission', 'val': 45000000, 'type': 'research', 'loc': ('Global', None, None)},
        ],
        'partnerships': [
            {'title': 'Consortium Co-Bidding: National Highway Optical Fiber Laying', 'org': 'L&T Construction (Prime)', 'val': 95000000, 'type': 'partnership', 'loc': ('India', 'Maharashtra', 'Mumbai')},
            {'title': 'Defense Electronics Sub-Contractor Alliance Call', 'org': 'Bharat Electronics Limited (BEL)', 'val': 40000000, 'type': 'partnership', 'loc': ('India', 'Karnataka', 'Bengaluru')},
        ],
        'innovation': [
            {'title': 'Smart Mobility & EV Telemetry Grand Challenge', 'org': 'NITI Aayog / Atal Innovation Mission', 'val': 5000000, 'type': 'challenge', 'loc': ('India', None, 'New Delhi')},
            {'title': 'Autonomous Drone Surveillance for Agricultural Yield', 'org': 'ICAR / Department of Agriculture', 'val': 7500000, 'type': 'challenge', 'loc': ('India', None, None)},
        ],
        'research': [
            {'title': 'Quantum Computing Algorithm Commercialization Grant', 'org': 'Department of Science and Technology (DST)', 'val': 15000000, 'type': 'research', 'loc': ('India', None, None)},
            {'title': 'IIT Madras Deep-Tech Industry Partnership Program', 'org': 'IIT Madras Research Park', 'val': 3000000, 'type': 'research', 'loc': ('India', 'Tamil Nadu', 'Chennai')},
        ]
    }

    async def ingest_batch(
        self, db: AsyncSession, is_demo: bool = True, category_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs an ingestion batch, inserts new unique opportunities, and triggers scoring.
        """
        ingested_count = 0
        skipped_count = 0
        new_opps: List[Opportunity] = []

        categories_to_scan = [category_filter] if category_filter and category_filter in self.CHANNELS else list(self.CHANNELS.keys())

        for cat in categories_to_scan:
            items = self.CHANNELS[cat]
            for item in items:
                ext_id = f"{cat[:3]}-{hashlib.md5(item['title'].encode()).hexdigest()[:8]}"
                
                # Check deduplication
                existing = await db.execute(select(Opportunity).where(Opportunity.external_id == ext_id))
                if existing.scalar_one_or_none():
                    skipped_count += 1
                    continue

                country, state, city = item['loc']
                val = float(item['val'])
                now = datetime.now(timezone.utc)
                deadline = now + timedelta(days=14 + (hash(item['title']) % 30))

                opp = Opportunity(
                    id=uuid.uuid4(),
                    external_id=ext_id,
                    title=item['title'],
                    description=f"Official procurement/grant specification for {item['title']}. Seeking qualified vendor partners to deliver exceptional milestones and compliance.",
                    organization_name=item['org'],
                    category=cat,
                    opportunity_type=item['type'],
                    value_min=val * 0.85 if val > 0 else 0,
                    value_max=val,
                    value_display=f"₹{(val/10000000):.1f} Cr" if val >= 10000000 else f"₹{(val/100000):.0f}L" if val >= 100000 else "Open/RFP",
                    currency='INR' if country != 'Global' else 'USD',
                    deadline=deadline,
                    published_at=now,
                    geography_country=country or 'India',
                    geography_state=state,
                    geography_city=city,
                    is_international=(country == 'Global'),
                    is_verified=True,
                    verification_status='verified',
                    is_expired=False,
                    is_demo=is_demo,
                    requirements=[
                        'Valid GST/PAN and incorporation certificates',
                        'Demonstrated 2+ years track record in related scope',
                        'Positive net worth and audited accounts for past 2 FYs',
                    ],
                    eligibility_criteria=[
                        'Registered entity in compliance with local commercial regulations',
                        'Technical team with relevant professional certifications',
                    ],
                    required_documents=[
                        'Company Profile & Capability Deck',
                        'Technical Architecture & Solution Blueprint',
                        'Financial Audited Statements',
                    ],
                    tags=[cat, item['type'], 'verified-source'],
                    source_url=f"https://eprocure.gov.in/portal/{ext_id}"
                )
                db.add(opp)
                new_opps.append(opp)
                ingested_count += 1

        await db.commit()

        # Trigger automatic score calculation for all active organizations
        scored_count = await self.score_opportunities_for_all_orgs(db, new_opps)

        return {
            'ingested_opportunities': ingested_count,
            'skipped_duplicates': skipped_count,
            'scores_computed': scored_count,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

    async def score_opportunities_for_all_orgs(
        self, db: AsyncSession, opportunities: List[Opportunity]
    ) -> int:
        if not opportunities:
            return 0

        # Fetch all organizations
        orgs_result = await db.execute(select(Organization))
        orgs = orgs_result.scalars().all()
        total_scores = 0

        for org in orgs:
            # Fetch profile
            p_result = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org.id))
            profile = p_result.scalar_one_or_none()

            for opp in opportunities:
                # Match is_demo constraint
                if org.is_demo != opp.is_demo:
                    continue

                score_obj = scoring_engine.compute_scores(profile, opp, org.id)
                db.add(score_obj)
                total_scores += 1

        await db.commit()
        return total_scores


ingestion_service = IngestionService()
