from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.models.business_profile import BusinessProfile
from app.models.business_profile_version import BusinessProfileVersion
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
from app.services.scoring_service import scoring_engine

logger = logging.getLogger(__name__)

class BusinessContextService:
    """
    Central Server-Side Business Context Service.
    Single Source of Truth connecting Business DNA to discovery, scoring,
    eligibility, readiness, search, and AI Analyst prompts.
    """

    async def get_context(self, org_id: uuid.UUID, db: AsyncSession) -> Dict[str, Any]:
        """Compiles the complete single source of truth context for an organization."""
        profile_res = await db.execute(select(BusinessProfile).where(BusinessProfile.organization_id == org_id))
        profile = profile_res.scalar_one_or_none()

        org_res = await db.execute(select(Organization).where(Organization.id == org_id))
        org = org_res.scalar_one_or_none()

        if not profile:
            return {
                "organization_id": str(org_id),
                "company_name": org.name if org else "Unknown Organization",
                "completeness": {"score": 0, "missing": ["Profile not initiated"]},
                "readiness": {"score": 0, "tier": "Incomplete Profile", "gaps": []},
                "version": 1,
            }

        # Fetch latest version
        ver_res = await db.execute(
            select(BusinessProfileVersion)
            .where(BusinessProfileVersion.organization_id == org_id)
            .order_by(desc(BusinessProfileVersion.version))
            .limit(1)
        )
        latest_version = ver_res.scalar_one_or_none()
        current_version_num = latest_version.version if latest_version else 1

        completeness = self.calculate_completeness(profile)
        readiness = self.calculate_readiness(profile)

        return {
            "organization_id": str(org_id),
            "company_name": profile.company_name or (org.name if org else ""),
            "trade_name": profile.trade_name,
            "legal_name": profile.legal_name,
            "registration_number": profile.registration_number,
            "founded_year": profile.founded_year,
            "website": profile.website,
            "linkedin": profile.linkedin,
            "country": profile.country or "India",
            "state": profile.state,
            "city": profile.city,
            "address": profile.address,
            "description": profile.description,
            "industry": profile.industry or "Information Technology",
            "sub_industry": profile.sub_industry,
            "company_size": profile.company_size or "11-50",
            "technical_headcount": profile.technical_headcount or "10",
            "business_stage": profile.business_stage or "Scaling",
            "enterprise_classification": profile.enterprise_classification or "MSME Small",
            "revenue_range": profile.revenue_range,
            "products_services": list(profile.products_services or []),
            "capabilities": list(profile.capabilities or []),
            "tech_stack": list(profile.tech_stack or []),
            "certifications": list(profile.certifications or []),
            "registrations": list(profile.registrations or []),
            "previous_projects": list(profile.previous_projects or []),
            "preferred_contract_min": float(profile.preferred_contract_min or 0),
            "preferred_contract_max": float(profile.preferred_contract_max or 0),
            "preferred_currency": profile.preferred_currency or "INR",
            "target_markets": list(profile.target_markets or []),
            "geographic_coverage": list(profile.geographic_coverage or []),
            "delivery_regions": list(profile.delivery_regions or []),
            "funding_required": bool(profile.funding_required),
            "export_focused": bool(profile.export_focused),
            "consortium_open": bool(profile.consortium_open),
            "growth_goals": profile.growth_goals,
            "documents": list(profile.documents or []),
            "version": current_version_num,
            "last_updated": profile.updated_at.isoformat() if profile.updated_at else datetime.now(timezone.utc).isoformat(),
            "completeness": completeness,
            "readiness": readiness,
        }

    def calculate_completeness(self, profile: BusinessProfile) -> Dict[str, Any]:
        """Calculates granular profile completeness (0-100%) and explains missing dimensions."""
        checks = [
            {
                "section": "Identity & Legal",
                "weight": 15,
                "passed": bool(profile.company_name and (profile.website or profile.registration_number) and profile.city),
                "field": "Registration & Location",
                "why_it_matters": "Required for statutory qualification and regional procurement filters."
            },
            {
                "section": "Industry & Scale",
                "weight": 10,
                "passed": bool(profile.industry and profile.company_size and profile.business_stage),
                "field": "Industry & Size Classification",
                "why_it_matters": "Determines qualification tiers and enterprise classification exemptions."
            },
            {
                "section": "Offerings",
                "weight": 15,
                "passed": bool(profile.products_services and len(profile.products_services) > 0),
                "field": "Products & Services Catalog",
                "why_it_matters": "Enables the AI to match specific RFP deliverable line-items."
            },
            {
                "section": "Core Capabilities",
                "weight": 15,
                "passed": bool(profile.capabilities and len(profile.capabilities) >= 3),
                "field": "Capabilities (at least 3)",
                "why_it_matters": "Primary driver of 8-dimension match scoring and technical fit."
            },
            {
                "section": "Technology Stack",
                "weight": 10,
                "passed": bool(profile.tech_stack and len(profile.tech_stack) >= 2),
                "field": "Technology Stack",
                "why_it_matters": "Matches technical specifications in RFP scope of work documents."
            },
            {
                "section": "Certifications",
                "weight": 15,
                "passed": bool(profile.certifications and len(profile.certifications) >= 1),
                "field": "Certifications (ISO, MSME, GeM, etc.)",
                "why_it_matters": "Mandatory pass/fail criteria in 80%+ of formal procurement bids."
            },
            {
                "section": "Past Performance",
                "weight": 10,
                "passed": bool(profile.previous_projects and len(profile.previous_projects) >= 1),
                "field": "Past Projects & Case Studies",
                "why_it_matters": "Proves past performance for client track record scoring."
            },
            {
                "section": "Target Contract Range",
                "weight": 10,
                "passed": bool(profile.preferred_contract_max and profile.preferred_contract_max > 0),
                "field": "Contract Size Parameters",
                "why_it_matters": "Prevents deprioritizing opportunities that fit your commercial appetite."
            }
        ]

        earned = sum(c["weight"] for c in checks if c["passed"])
        missing = [c for c in checks if not c["passed"]]

        return {
            "score": earned,
            "is_complete": earned >= 90,
            "passed_count": len([c for c in checks if c["passed"]]),
            "total_checks": len(checks),
            "missing_items": [
                {
                    "section": c["section"],
                    "field": c["field"],
                    "weight_points": c["weight"],
                    "why_it_matters": c["why_it_matters"]
                }
                for c in missing
            ]
        }

    def calculate_readiness(self, profile: BusinessProfile, opportunity: Optional[Opportunity] = None) -> Dict[str, Any]:
        """
        Calculates Opportunity Readiness (distinct from profile completeness).
        Determines if the company possesses the certifications, capacity,
        and evidence to win formal competitive bids.
        """
        gaps = []
        score = 100

        certs = [str(c).lower() for c in (profile.certifications or [])]

        # 1. ISO 9001 / ISO 27001 check
        has_iso = any('iso' in c for c in certs)
        if not has_iso:
            score -= 20
            gaps.append({
                "type": "certification_gap",
                "severity": "high",
                "title": "ISO Quality / Security Certification Missing",
                "recommendation": "Obtain ISO 9001 or ISO 27001, or partner with a certified co-bidder to unlock high-value tenders."
            })

        # 2. Statutory / MSME check
        has_gov_cert = any(k in c for c in certs for k in ['msme', 'udyam', 'dpiit', 'gem'])
        if not has_gov_cert:
            score -= 15
            gaps.append({
                "type": "registration_gap",
                "severity": "medium",
                "title": "No Public Sector Vendor Credential Found",
                "recommendation": "Register on GeM or link Udyam / DPIIT certification to claim EMD exemptions."
            })

        # 3. Past performance track record
        projects = list(profile.previous_projects or [])
        if len(projects) == 0:
            score -= 25
            gaps.append({
                "type": "track_record_gap",
                "severity": "high",
                "title": "Zero Verified Past Projects on Record",
                "recommendation": "Document at least 1 completed contract to clear minimum turnover & experience hurdles."
            })

        # 4. Collateral / capability statement document
        docs = list(profile.documents or [])
        if len(docs) == 0:
            score -= 15
            gaps.append({
                "type": "collateral_gap",
                "severity": "medium",
                "title": "No Pitch Deck or Capability Statement Uploaded",
                "recommendation": "Upload an executive capability statement to the Evidence Vault for automated proposal generation."
            })

        # 5. Technical Headcount / Team capacity
        try:
            headcount = int(str(profile.technical_headcount or '0').split('-')[0].strip())
        except Exception:
            headcount = 5

        if headcount < 5:
            score -= 10
            gaps.append({
                "type": "capacity_gap",
                "severity": "low",
                "title": "Limited Technical Delivery Capacity (< 5)",
                "recommendation": "Consider teaming or consortium arrangements for multi-workstream execution."
            })

        score = max(score, 10)
        tier = "Ready to Bid" if score >= 80 else ("Preparation Required" if score >= 55 else "Significant Gaps")

        return {
            "score": score,
            "tier": tier,
            "gaps_count": len(gaps),
            "gaps": gaps
        }

    async def handle_dna_update(
        self,
        profile: BusinessProfile,
        user_id: Optional[uuid.UUID],
        updated_fields: Dict[str, Any],
        old_snapshot: Dict[str, Any],
        reason: Optional[str],
        db: AsyncSession
    ) -> BusinessProfileVersion:
        """
        Emits BUSINESS_DNA_UPDATED event:
        1. Computes diff and tracks new version record.
        2. Recalculates 8-dimension match scores for all active opportunities.
        3. Computes delta impact metrics (how many improved, became eligible, etc.).
        4. Persists the version record.
        """
        org_id = profile.organization_id

        # Compute diff
        diff = {}
        changed_field_names = []
        for field, new_val in updated_fields.items():
            old_val = old_snapshot.get(field)
            if old_val != new_val:
                diff[field] = {"old": old_val, "new": new_val}
                changed_field_names.append(field)

        # Get latest version number
        ver_res = await db.execute(
            select(func.coalesce(func.max(BusinessProfileVersion.version), 0))
            .where(BusinessProfileVersion.organization_id == org_id)
        )
        max_ver = ver_res.scalar() or 0
        new_ver_num = max_ver + 1

        # Re-score opportunities and calculate actual impact
        opp_res = await db.execute(select(Opportunity).where(Opportunity.is_expired == False))
        opps = opp_res.scalars().all()

        re_evaluated = 0
        score_improved = 0
        score_decreased = 0
        newly_eligible = 0
        high_relevance_count = 0

        for opp in opps:
            sc_res = await db.execute(
                select(OpportunityScore).where(
                    OpportunityScore.opportunity_id == opp.id,
                    OpportunityScore.organization_id == org_id
                )
            )
            existing_score = sc_res.scalar_one_or_none()
            new_score = scoring_engine.compute_scores(profile, opp, org_id)
            re_evaluated += 1

            old_overall = existing_score.overall_score if existing_score else 0.0
            new_overall = new_score.overall_score

            if new_overall > old_overall + 1.0:
                score_improved += 1
            elif new_overall < old_overall - 1.0:
                score_decreased += 1

            if old_overall < 65.0 and new_overall >= 70.0:
                newly_eligible += 1

            if new_overall >= 80.0:
                high_relevance_count += 1

            if existing_score:
                existing_score.overall_score = new_score.overall_score
                existing_score.eligibility_score = new_score.eligibility_score
                existing_score.business_fit_score = new_score.business_fit_score
                existing_score.capability_fit_score = new_score.capability_fit_score
                existing_score.geographic_fit_score = new_score.geographic_fit_score
                existing_score.value_fit_score = new_score.value_fit_score
                existing_score.time_feasibility_score = new_score.time_feasibility_score
                existing_score.competition_score = new_score.competition_score
                existing_score.execution_fit_score = new_score.execution_fit_score
                existing_score.recommendation = new_score.recommendation
                existing_score.recommendation_reason = new_score.recommendation_reason
            else:
                db.add(new_score)

        impact_summary = {
            "re_evaluated": re_evaluated,
            "score_improved": score_improved,
            "score_decreased": score_decreased,
            "newly_eligible": newly_eligible,
            "high_relevance_count": high_relevance_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "trigger_reason": reason or f"Updated {len(changed_field_names)} business fields"
        }

        # Snapshot of new profile
        new_snapshot = {
            "company_name": profile.company_name,
            "industry": profile.industry,
            "capabilities": profile.capabilities,
            "tech_stack": profile.tech_stack,
            "certifications": profile.certifications,
            "contract_min": float(profile.preferred_contract_min or 0),
            "contract_max": float(profile.preferred_contract_max or 0),
            "geographic_coverage": profile.geographic_coverage,
        }

        version_record = BusinessProfileVersion(
            id=uuid.uuid4(),
            organization_id=org_id,
            version=new_ver_num,
            changed_fields=changed_field_names,
            diff=diff,
            changed_by=user_id,
            reason=reason or f"Updated fields: {', '.join(changed_field_names[:4])}",
            snapshot=new_snapshot,
            impact_summary=impact_summary
        )
        db.add(version_record)
        await db.commit()
        await db.refresh(version_record)

        logger.info(
            f"[BusinessContext] Organization {org_id} updated to v{new_ver_num}. "
            f"Impact: {re_evaluated} re-evaluated, {score_improved} improved, {newly_eligible} newly eligible."
        )

        return version_record

    def format_ai_system_prompt_context(self, context: Dict[str, Any]) -> str:
        """Grounds AI Analyst in live, authentic Business DNA."""
        caps = ", ".join(context.get("capabilities", [])[:8]) or "Not specified"
        tech = ", ".join(context.get("tech_stack", [])[:8]) or "Not specified"
        certs = ", ".join(context.get("certifications", [])) or "None verified"
        c_min = context.get("preferred_contract_min", 0)
        c_max = context.get("preferred_contract_max", 0)
        cur = context.get("preferred_currency", "INR")
        c_range = f"{cur} {c_min:,.0f} – {c_max:,.0f}" if c_max > 0 else "Flexible / Any"

        return f"""
=== VERIFIED BUSINESS CONTEXT (OpportunityOS DNA v{context.get('version', 1)}) ===
Company: {context.get('company_name')} | Legal: {context.get('legal_name', 'N/A')}
Industry: {context.get('industry')} (Sub: {context.get('sub_industry', 'N/A')})
Location: {context.get('city', 'N/A')}, {context.get('state', 'N/A')}, {context.get('country', 'India')}
Enterprise Scale: {context.get('enterprise_classification', 'MSME')} | Size: {context.get('company_size', '11-50')}
Technical Headcount: {context.get('technical_headcount', '10')} | Stage: {context.get('business_stage', 'Scaling')}
Capabilities: {caps}
Technology Stack: {tech}
Verified Certifications: {certs}
Target Contract Tier: {c_range}
Target Geographies: {', '.join(context.get('geographic_coverage', []) or ['India'])}
DNA Completeness: {context.get('completeness', {}).get('score', 0)}%
Readiness Tier: {context.get('readiness', {}).get('tier', 'Standard')} (Readiness Score: {context.get('readiness', {}).get('score', 0)}%)
=============================================================================
"""

business_context_service = BusinessContextService()
