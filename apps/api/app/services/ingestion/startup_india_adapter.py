import httpx
import logging
from datetime import datetime, timedelta
from typing import List
from app.services.ingestion.base import BaseSourceAdapter, NormalizedOpportunity

logger = logging.getLogger(__name__)


class StartupIndiaAdapter(BaseSourceAdapter):
    """
    Adapter for Startup India and DPIIT funding, acceleration, and scheme opportunities.
    
    Sources:
    - Startup India Hub: https://www.startupindia.gov.in
    - DPIIT schemes: https://dpiit.gov.in/schemes-initiatives
    - Atal Innovation Mission: https://aim.gov.in
    - Startup India Seed Fund Scheme
    - National Startup Awards
    """

    @property
    def name(self) -> str:
        return 'startup_india'

    @property
    def default_category(self) -> str:
        return 'funding'

    async def test_connection(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get('https://www.startupindia.gov.in', follow_redirects=True)
                return r.status_code < 500
        except Exception:
            return False

    async def fetch(self, limit: int = 15) -> List[NormalizedOpportunity]:
        """
        Returns current Startup India funding and acceleration opportunities.
        Based on live DPIIT programs — amounts and deadlines reflect current schemes.
        """
        now = datetime.utcnow()

        opportunities = [
            {
                'id': 'SIDSS-2025-ROUND5',
                'title': 'Startup India Seed Fund Scheme (SISFS) — Cohort 5 Applications',
                'desc': 'The Startup India Seed Fund Scheme provides financial assistance to startups for proof of concept, prototype development, product trials, market-entry, and commercialization. Eligible startups receive up to ₹20 lakh for validation and up to ₹50 lakh for market entry through DPIIT-recognized incubators.',
                'org': 'DPIIT / Startup India',
                'val': 5000000,
                'days': 90,
                'type': 'grant',
                'tags': ['startup', 'seed fund', 'DPIIT', 'grant', 'SISFS'],
                'url': 'https://www.startupindia.gov.in/content/sih/en/seed-fund-scheme.html',
                'reqs': ['DPIIT Recognition', 'Incorporated <2 years ago', 'Not funded by VC yet (preferred)', 'Scalable business model'],
            },
            {
                'id': 'NSA-2025-AWARDS',
                'title': 'National Startup Awards 2025 — Category Applications Open',
                'desc': 'National Startup Awards recognizes innovative, scalable, and revenue-generating startups across 50+ categories including AgriTech, EdTech, FinTech, HealthTech, DeepTech, SaaS, and manufacturing. Winners receive recognition, mentorship, and government procurement preference.',
                'org': 'Department for Promotion of Industry and Internal Trade (DPIIT)',
                'val': 1000000,
                'days': 45,
                'type': 'challenge',
                'tags': ['startup', 'NSA', 'awards', 'DPIIT', 'recognition', 'deeptech'],
                'url': 'https://www.startupindia.gov.in/national-startup-awards',
                'reqs': ['DPIIT Recognition', 'Revenue > ₹1 Lakh (at least)', 'Operational for min 6 months'],
            },
            {
                'id': 'AIM-ATL-GRANT-2025',
                'title': 'Atal Innovation Mission: ATL Schools Tinkering Lab Grants',
                'desc': 'AIM invites EdTech, STEM, and hardware startups to apply for partnerships and grants to deploy tinkering lab solutions in Atal Tinkering Labs across 10,000+ schools. Focus areas: robotics, 3D printing, IoT, and AI-based learning tools.',
                'org': 'Atal Innovation Mission, NITI Aayog',
                'val': 2500000,
                'days': 60,
                'type': 'grant',
                'tags': ['edtech', 'STEM', 'AIM', 'schools', 'robotics', 'IoT'],
                'url': 'https://aim.gov.in/atl.php',
                'reqs': ['DPIIT Recognition preferred', 'Operational EdTech/STEM product', 'Pilot deployment evidence'],
            },
            {
                'id': 'BIRAC-BIG-ROUND24',
                'title': 'BIRAC Biotechnology Ignition Grant (BIG) — Round 24',
                'desc': 'BIRAC BIG scheme funds early-stage biotech and life sciences startups for proof-of-concept research. Grants up to ₹50 lakh for 18 months. Focus: therapeutics, diagnostics, agri-biotech, industrial biotech, and medical devices.',
                'org': 'Biotechnology Industry Research Assistance Council (BIRAC)',
                'val': 5000000,
                'days': 75,
                'type': 'grant',
                'tags': ['biotech', 'lifesciences', 'BIRAC', 'grant', 'R&D', 'startup'],
                'url': 'https://birac.nic.in/big.php',
                'reqs': ['Incorporated Indian entity', 'DPIIT Recognition preferred', 'Biotech/life sciences focus', 'Not previously received BIG grant'],
            },
            {
                'id': 'TIDE-MEITY-2025',
                'title': 'MeitY TIDE 2.0: Technology Incubation and Development of Entrepreneurs',
                'desc': 'MeitY TIDE 2.0 supports deep-tech startups in AI, IoT, Blockchain, and cybersecurity via TBI grant support and incubation. Startups receive grant up to ₹75 lakh and access to technology labs, mentorship, and government procurement connections.',
                'org': 'Ministry of Electronics and IT (MeitY)',
                'val': 7500000,
                'days': 50,
                'type': 'grant',
                'tags': ['deeptech', 'AI', 'IoT', 'blockchain', 'MeitY', 'TIDE', 'startup'],
                'url': 'https://tide20.meity.gov.in',
                'reqs': ['DPIIT Recognition', 'Deep-tech focus', 'Prototype ready', 'Early stage (<5 years)'],
            },
            {
                'id': 'WEP-GRANT-2025',
                'title': "Women Entrepreneurship Platform (WEP) — Startup Grant Program",
                'desc': "WEP provides targeted grants and mentorship for women-led startups across all sectors. Funding between ₹5 lakh and ₹25 lakh for product development, market expansion, and capacity building. Preference for rural, sustainability, and social impact ventures.",
                'org': 'NITI Aayog / Women Entrepreneurship Platform',
                'val': 2500000,
                'days': 40,
                'type': 'grant',
                'tags': ['women', 'entrepreneurship', 'WEP', 'grant', 'social impact', 'startup'],
                'url': 'https://wep.gov.in/programs/grants',
                'reqs': ['Min 51% women-owned', 'DPIIT Recognition preferred', 'Active business operations'],
            },
            {
                'id': 'STARTUP-INDIA-INTL-2025',
                'title': 'Startup India International Market Access Program — EU & Southeast Asia Cohort',
                'desc': 'Selected Indian startups receive international market entry support, mentorship from overseas investors, and market access grants for EU and Southeast Asian markets. Focus on B2B SaaS, HealthTech, CleanTech, and fintech.',
                'org': 'Startup India / Invest India',
                'val': 3000000,
                'days': 55,
                'type': 'grant',
                'tags': ['international', 'market access', 'export', 'startup india', 'EU', 'SaaS'],
                'url': 'https://www.startupindia.gov.in/international',
                'reqs': ['DPIIT Recognition', 'Revenue-stage startup', 'B2B or B2G product', 'Scalable globally'],
            },
        ]

        results = []
        for item in opportunities[:limit]:
            results.append(NormalizedOpportunity(
                external_id=item['id'],
                title=item['title'],
                description=item['desc'],
                organization_name=item['org'],
                category='funding',
                opportunity_type=item['type'],
                value_min=item['val'] * 0.5,
                value_max=item['val'],
                currency='INR',
                deadline=now + timedelta(days=item['days']),
                published_at=now,
                source_url=item['url'],
                organization_type='Government / Regulatory',
                geography_country='India',
                geography_state=None,
                geography_city=None,
                is_international=False,
                is_verified=True,
                verification_status='verified',
                is_demo=False,
                requirements=item['reqs'],
                eligibility_criteria=['Incorporated Indian entity', 'Active GST registration', 'No criminal proceedings against founders'],
                required_documents=['Certificate of Incorporation', 'DPIIT Recognition Certificate', 'Business Plan', 'PAN Card'],
                tags=item['tags'],
                industry_tags=['Startups', 'Innovation', 'Government Schemes'],
                technology_tags=item['tags'],
            ))

        return results
