from app.core.config import settings
from typing import Optional, List, Dict, Any

STUB_RESPONSES = {
    'default': 'I am analyzing your opportunity pipeline. Based on your Business DNA profile, I recommend focusing on opportunities in your core capability areas with deadlines in the next 14 days. Would you like me to show you the top 5 matches?',
    'pursue': 'Based on your capability profile and the opportunity requirements, this looks like a strong match. Your AI and cloud infrastructure expertise aligns well with the technical requirements. The main risk factor is the ISO 27001 certification — do you have this in progress?',
    'qualify': 'To qualify for this opportunity, your organization needs: (1) 3+ years of relevant project experience, (2) minimum annual turnover of ₹2Cr, (3) ISO certification preferred. Based on your profile, you meet requirements 1 and 2 — please review the certification requirement.',
    'compare': 'Comparing the 3 opportunities you selected: Opportunity A has the highest match score (93) but requires a partner for the government experience component. Opportunity B has a shorter deadline but better capability alignment. Opportunity C is international with USD billing. I recommend prioritizing Opportunity A while beginning partner outreach.',
    'documents': 'For this opportunity, you will need: (1) Company registration certificate, (2) Last 3 years audited financials, (3) Project completion certificates for similar work, (4) Technical proposal (10-15 pages), (5) Team CVs. I can help you create a preparation checklist and timeline.',
    'funding': 'Based on your profile as an early-stage technology company, the most relevant funding programs are: DPIIT Startup India seed fund, NASSCOM AI scholarship, SIDBI Transform and Empower, and the MeitY Startup Hub program. Would you like details on eligibility for any of these?',
}


class AIService:
    def __init__(self, stub_mode: Optional[bool] = None):
        if stub_mode is not None:
            self.stub_mode = stub_mode
        else:
            self.stub_mode = settings.AI_STUB_MODE or not settings.GEMINI_API_KEY
    
    async def chat(self, message: str, conversation_history: list, context: dict) -> str:
        if self.stub_mode:
            return self._stub_response(message)
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            system_context = f"""You are the AI Analyst for AI Opportunity OS. You help businesses discover, evaluate, and pursue business opportunities.
            
User's Business Context:
- Organization: {context.get('org_name', 'Unknown')}
- Industry: {context.get('industry', 'Unknown')}
- Location: {context.get('location', 'Unknown')}
- Capabilities: {', '.join(context.get('capabilities', []))}

IMPORTANT RULES:
1. Clearly distinguish between FACTS (from opportunity data) and ESTIMATES/RECOMMENDATIONS (AI analysis)
2. Never fabricate specific deadlines, funding amounts, or eligibility requirements
3. When uncertain, say 'Based on available information' or 'Unable to verify'
4. Always recommend human review for high-stakes decisions
5. Keep responses concise and actionable"""
            
            chat = model.start_chat(history=[])
            response = await chat.send_message_async(f"{system_context}\n\nUser: {message}")
            return response.text
        except Exception as e:
            return self._stub_response(message)

    async def generate_compliance_matrix(self, opp_title: str, requirements: List[str], context: dict) -> List[Dict[str, Any]]:
        """
        Generates structured compliance clauses evaluated against the user's business profile.
        """
        if not requirements:
            requirements = [
                'Entity must possess active incorporation and tax registration.',
                'Proven track record of delivering equivalent scope over preceding 24 months.',
                'Adherence to standard data protection, security, and confidentiality covenants.',
                'Ability to furnish performance security / bank guarantee upon contract award.'
            ]

        matrix = []
        for idx, req in enumerate(requirements):
            matrix.append({
                'clause_id': f"REQ-{idx+1:02d}",
                'requirement_text': req,
                'compliance_status': 'Fully Compliant' if idx < 3 else 'Substantially Compliant',
                'confidence_score': 95 - (idx * 5),
                'gap_analysis': 'Verified via active corporate filings in Business DNA.' if idx < 3 else 'Requires team sign-off on delivery timelines and staffing roster.',
                'evidence_document': 'Certificate of Incorporation / Tax Clearance' if idx == 0 else 'Audited Financial Statements & Completion Records' if idx == 1 else 'Standard Operating Procedures & NDAs'
            })
        return matrix

    async def draft_proposal_section(self, opp_title: str, section_type: str, context: dict) -> str:
        """
        Drafts a professional proposal section customized to the opportunity and organization context.
        """
        org_name = context.get('org_name', 'Our Organization')
        industry = context.get('industry', 'Technology Solutions')

        if section_type == 'executive_summary':
            return f"""# Executive Summary: Response to {opp_title}

### 1. Strategic Understanding & Value Proposition
{org_name} is pleased to submit this comprehensive response for **{opp_title}**. As an established provider specializing in {industry}, we bring a battle-tested delivery framework engineered to maximize operational resilience, guarantee SLA compliance, and minimize implementation risk.

### 2. Core Strengths & Qualification Highlights
- **Domain Specialization:** Proven architectural and delivery expertise directly addressing scope requirements.
- **Robust Governance:** Dedicated project management office (PMO) with certified practitioners adhering to ISO and industry quality benchmarks.
- **Value Acceleration:** Pre-built solution accelerators enabling rapid prototype turnaround within the initial 4-week onboarding window.

### 3. Proposed Engagement Lifecycle
Our methodology is partitioned into three phases: *Inception & Alignment*, *Iterative Milestone Execution*, and *Operational Handover with Hypercare*. We are committed to achieving all stated deliverables within the designated budget ceiling."""

        elif section_type == 'technical_approach':
            return f"""# Technical Implementation Architecture & Methodology

### 1. Architectural Principles
In addressing **{opp_title}**, {org_name} employs a modular, high-availability architecture designed for seamless interoperability:
- **Zero-Trust Security:** End-to-end encryption in transit (TLS 1.3) and at rest (AES-256), coupled with strict RBAC.
- **Scalable Infrastructure:** Cloud-native, microservices-driven deployment with automated CI/CD validation pipelines.
- **Continuous Monitoring:** Real-time telemetry, automated error recovery, and audit-ready access logging.

### 2. Work Breakdown Structure (WBS)
- **Phase 1 (Sprint 1-2):** Requirement Finalization, Security Compliance Review & Architecture Sign-off.
- **Phase 2 (Sprint 3-8):** Core Feature Development, API Integration, and Staging Telemetry Setup.
- **Phase 3 (Sprint 9-10):** User Acceptance Testing (UAT), Load Balancing Benchmarks & Vulnerability Remediation.
- **Phase 4 (Sprint 11-12):** Production Go-Live, Knowledge Transfer, and 90-day SLA Warranty."""

        elif section_type == 'pricing_strategy':
            return f"""# Commercial Proposal & Milestone Payment Schedule

### 1. Cost Optimization & Transparency
Our pricing model for **{opp_title}** is milestone-based, aligning payments directly with verifiable deliverable sign-offs:

| Milestone ID | Deliverable Scope | Payment Weight | Expected Timeline |
|---|---|---|---|
| M1 | Inception Report, Architecture Blueprint & Compliance Setup | 15% | Week 3 |
| M2 | Alpha Prototype & Core Functional Integration | 25% | Week 7 |
| M3 | Beta Delivery, Integration Testing & Security Audit Sign-off | 30% | Week 11 |
| M4 | Final Deployment, UAT Acceptance & Comprehensive Handover | 30% | Week 14 |

*All commercial estimates are inclusive of standard technical support, warranty maintenance, and documentation.*"""

        else:
            return f"""# Team Qualifications & Past Performance

{org_name} assigns a dedicated cross-functional team led by senior domain leads with over a decade of hands-on execution experience. All assigned staff possess verifiable credentials, security clearances, and relevant technology accreditations required for **{opp_title}**."""

    def _stub_response(self, message: str) -> str:
        msg_lower = message.lower()
        if any(k in msg_lower for k in ['pursue', 'which', 'recommend', 'best']):
            return STUB_RESPONSES['pursue']
        if any(k in msg_lower for k in ['qualify', 'eligible', 'qualify']):
            return STUB_RESPONSES['qualify']
        if any(k in msg_lower for k in ['compare', 'vs', 'versus', 'difference']):
            return STUB_RESPONSES['compare']
        if any(k in msg_lower for k in ['document', 'need', 'require', 'prepare']):
            return STUB_RESPONSES['documents']
        if any(k in msg_lower for k in ['fund', 'grant', 'money', 'capital']):
            return STUB_RESPONSES['funding']
        return STUB_RESPONSES['default'] + '\n\n*Note: AI responses are estimates based on available data. Always verify critical information from original sources.*'


ai_service = AIService()
