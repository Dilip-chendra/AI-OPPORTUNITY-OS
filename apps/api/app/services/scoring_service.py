import math
from typing import Dict, Any, Tuple, Optional, List
from app.models.business_profile import BusinessProfile
from app.models.opportunity import Opportunity
from app.models.opportunity_score import OpportunityScore
import uuid


class ScoringEngine:
    """
    8-Dimension Quantitative Matching Engine for AI Opportunity OS.
    Evaluates fit between a company's Business DNA and any Opportunity.
    
    Dimensions:
    1. eligibility_score (0-100) — Mandatory qualification criteria & certifications
    2. business_fit_score (0-100) — Industry, sector & domain alignment
    3. capability_fit_score (0-100) — Keywords & technical requirement overlap
    4. geographic_fit_score (0-100) — Location bounds and cross-border reach
    5. value_fit_score (0-100) — Budget range compatibility vs target contract size
    6. time_feasibility_score (0-100) — Days to deadline vs submission complexity
    7. competition_score (0-100) — Estimated win probability given market density
    8. execution_fit_score (0-100) — Team size readiness & track record alignment
    """

    # Configurable dimension weights (sums to 1.0)
    WEIGHTS = {
        'eligibility': 0.25,
        'capability_fit': 0.20,
        'business_fit': 0.15,
        'value_fit': 0.15,
        'time_feasibility': 0.10,
        'geographic_fit': 0.05,
        'competition': 0.05,
        'execution_fit': 0.05,
    }

    def compute_scores(
        self, profile: Optional[BusinessProfile], opportunity: Opportunity, organization_id: uuid.UUID
    ) -> OpportunityScore:
        if not profile:
            # Fallback baseline score if profile is incomplete
            return OpportunityScore(
                opportunity_id=opportunity.id,
                organization_id=organization_id,
                overall_score=70.0,
                eligibility_score=75.0,
                business_fit_score=70.0,
                capability_fit_score=70.0,
                geographic_fit_score=80.0,
                value_fit_score=70.0,
                time_feasibility_score=70.0,
                competition_score=65.0,
                execution_fit_score=70.0,
                recommendation='review',
                recommendation_reason='Baseline score generated. Complete your Business DNA to refine accuracy.',
                is_ai_generated=True,
                score_metadata={'mode': 'default_baseline'}
            )

        # 1. Eligibility Score
        eligibility_score, elig_notes = self._calculate_eligibility(profile, opportunity)

        # 2. Business Fit Score
        business_fit_score, bus_notes = self._calculate_business_fit(profile, opportunity)

        # 3. Capability Fit Score
        capability_fit_score, cap_notes = self._calculate_capability_fit(profile, opportunity)

        # 4. Geographic Fit Score
        geographic_fit_score, geo_notes = self._calculate_geographic_fit(profile, opportunity)

        # 5. Value Fit Score
        value_fit_score, val_notes = self._calculate_value_fit(profile, opportunity)

        # 6. Time Feasibility Score
        time_feasibility_score, time_notes = self._calculate_time_feasibility(profile, opportunity)

        # 7. Competition Score
        competition_score, comp_notes = self._calculate_competition(profile, opportunity)

        # 8. Execution Fit Score
        execution_fit_score, exec_notes = self._calculate_execution_fit(profile, opportunity)

        # Weighted Overall Score
        overall = (
            eligibility_score * self.WEIGHTS['eligibility'] +
            capability_fit_score * self.WEIGHTS['capability_fit'] +
            business_fit_score * self.WEIGHTS['business_fit'] +
            value_fit_score * self.WEIGHTS['value_fit'] +
            time_feasibility_score * self.WEIGHTS['time_feasibility'] +
            geographic_fit_score * self.WEIGHTS['geographic_fit'] +
            competition_score * self.WEIGHTS['competition'] +
            execution_fit_score * self.WEIGHTS['execution_fit']
        )

        # If eligibility is severely failed (< 50), cap overall score to max 55 (fail-safe)
        if eligibility_score < 50.0:
            overall = min(overall, 55.0)

        overall = round(max(10.0, min(99.0, overall)), 1)

        # Determine Recommendation & Reason
        recommendation, reason = self._derive_recommendation(
            overall, eligibility_score, capability_fit_score, time_feasibility_score, opportunity
        )

        metadata = {
            'eligibility_notes': elig_notes,
            'business_fit_notes': bus_notes,
            'capability_notes': cap_notes,
            'geographic_notes': geo_notes,
            'value_notes': val_notes,
            'time_notes': time_notes,
            'competition_notes': comp_notes,
            'execution_notes': exec_notes,
        }

        return OpportunityScore(
            opportunity_id=opportunity.id,
            organization_id=organization_id,
            overall_score=overall,
            eligibility_score=round(eligibility_score, 1),
            business_fit_score=round(business_fit_score, 1),
            capability_fit_score=round(capability_fit_score, 1),
            geographic_fit_score=round(geographic_fit_score, 1),
            value_fit_score=round(value_fit_score, 1),
            time_feasibility_score=round(time_feasibility_score, 1),
            competition_score=round(competition_score, 1),
            execution_fit_score=round(execution_fit_score, 1),
            recommendation=recommendation,
            recommendation_reason=reason,
            score_metadata=metadata,
            is_ai_generated=True
        )

    def _calculate_eligibility(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        score = 85.0
        notes = []

        certs = profile.certifications if isinstance(profile.certifications, list) else []
        regs = profile.registrations if isinstance(profile.registrations, list) else []
        combined_creds = [str(c).lower() for c in (certs + regs)]

        # If it's a government tender or MSME grant in India
        if opp.category in ['government', 'funding'] and opp.geography_country == 'India':
            has_msme = any('msme' in c or 'udyam' in c for c in combined_creds)
            has_startup = any('startup' in c or 'dpiit' in c for c in combined_creds)
            if has_msme or has_startup:
                score += 10.0
                notes.append('Active MSME/Startup India certification confers eligibility advantage.')

        # If ISO 9001 / 27001 is mentioned in requirements
        req_text = str(opp.requirements or '').lower() + str(opp.eligibility_criteria or '').lower()
        if 'iso' in req_text:
            has_iso = any('iso' in c for c in combined_creds)
            if has_iso:
                score += 5.0
                notes.append('ISO compliance requirement satisfied.')
            else:
                score -= 15.0
                notes.append('Notice mandates ISO certification; verification required.')

        return max(30.0, min(100.0, score)), '; '.join(notes) or 'Standard criteria satisfied.'

    def _calculate_business_fit(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        profile_ind = (profile.industry or '').lower()
        opp_cat = (opp.category or '').lower()
        opp_title = (opp.title or '').lower()
        opp_desc = (opp.description or '').lower()

        score = 75.0
        if 'it' in profile_ind or 'software' in profile_ind or 'tech' in profile_ind:
            if any(k in opp_title or k in opp_desc for k in ['software', 'cloud', 'ai', 'digital', 'it', 'telecom', 'data']):
                score = 95.0
                return score, 'Direct technology and software industry match.'
        elif 'infrastructure' in profile_ind or 'construction' in profile_ind:
            if any(k in opp_title or k in opp_desc for k in ['civil', 'construction', 'road', 'building', 'infra']):
                score = 95.0
                return score, 'Direct civil & infrastructure engineering match.'
        
        return score, 'General sector compatibility.'

    def _calculate_capability_fit(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        caps = profile.capabilities if isinstance(profile.capabilities, list) else []
        if isinstance(profile.capabilities, str):
            caps = [c.strip() for c in profile.capabilities.split(',') if c.strip()]

        techs = profile.tech_stack if isinstance(profile.tech_stack, list) else []
        if isinstance(profile.tech_stack, str):
            techs = [t.strip() for t in profile.tech_stack.split(',') if t.strip()]

        prods = []
        if isinstance(profile.products_services, list):
            for p in profile.products_services:
                if isinstance(p, dict) and p.get('name'):
                    prods.append(p['name'])

        all_competencies = caps + techs + prods
        if not all_competencies:
            return 70.0, 'No explicit capabilities listed in Business DNA.'

        opp_corpus = f"{opp.title} {opp.description} {str(opp.requirements or '')} {str(opp.technology_tags or '')}".lower()
        matched = []
        for item in all_competencies:
            if str(item).lower() in opp_corpus:
                matched.append(str(item))

        if matched:
            ratio = len(matched) / max(1, min(len(all_competencies), 6))
            score = 72.0 + min(26.0, ratio * 26.0)
            return min(98.0, round(score, 1)), f"Matched competencies: {', '.join(matched[:4])}."
        
        return 72.0, 'Competencies evaluated against general scope.'

    def _calculate_geographic_fit(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        p_country = (profile.country or 'India').lower()
        o_country = (opp.geography_country or 'India').lower()

        if p_country == o_country:
            # Check state/city if available
            p_state = (profile.state or '').lower()
            o_state = (opp.geography_state or '').lower()
            if p_state and o_state and p_state == o_state:
                return 100.0, f"Headquarters situated in target state ({opp.geography_state})."
            return 90.0, 'Operating within same national jurisdiction.'
        
        if profile.export_focused or opp.is_international:
            return 85.0, 'Cross-border opportunity supported by export focus preference.'

        return 50.0, f"Cross-border location mismatch ({opp.geography_country})."

    def _calculate_value_fit(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        min_pref = float(profile.preferred_contract_min or 100000)
        max_pref = float(profile.preferred_contract_max or 100000000)
        opp_val = float(opp.value_max or opp.value_min or 0)

        if opp_val == 0:
            return 75.0, 'Value undisclosed in preliminary notice.'

        if min_pref <= opp_val <= max_pref:
            return 95.0, 'Contract value fits within ideal target budget boundaries.'
        elif opp_val < min_pref:
            return 65.0, 'Contract value is lower than preferred target scale.'
        else:
            return 70.0, 'Contract value exceeds typical single-bid capacity; consider consortium.'

    def _calculate_time_feasibility(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        if not opp.deadline:
            return 85.0, 'Rolling or unannounced deadline.'

        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        if opp.deadline.tzinfo is None:
            opp_deadline = opp.deadline.replace(tzinfo=timezone.utc)
        else:
            opp_deadline = opp.deadline

        days_left = (opp_deadline - now).total_seconds() / 86400.0

        if days_left < 0:
            return 0.0, 'Opportunity submission window has expired.'
        if days_left <= 3:
            return 45.0, 'Extremely tight deadline (under 3 days left).'
        if days_left <= 7:
            return 70.0, 'Urgent deadline (under 7 days left); expedited drafting required.'
        if days_left <= 21:
            return 95.0, 'Optimal runway (2-3 weeks) for proposal preparation.'
        return 90.0, 'Adequate submission runway (> 3 weeks).'

    def _calculate_competition(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        # Tenders with very high value or public categories have higher competition
        if opp.category == 'government':
            return 72.0, 'Standard competitive density in public procurement.'
        if opp.category == 'funding':
            return 80.0, 'Grant awards evaluated on merit rather than lowest price.'
        if opp.category == 'corporate':
            return 78.0, 'Corporate roster selection based on capability qualification.'
        return 82.0, 'Favorable competitive positioning.'

    def _calculate_execution_fit(self, profile: BusinessProfile, opp: Opportunity) -> Tuple[float, str]:
        size = profile.company_size or '11-50'
        past_projects = profile.previous_projects if isinstance(profile.previous_projects, list) else []
        score = 85.0
        notes = []

        if past_projects:
            score += min(10.0, len(past_projects) * 3.0)
            notes.append(f"Verified track record across {len(past_projects)} past project(s)")

        if size in ['51-200', '201-500', '500+']:
            score += 5.0
            notes.append('Enterprise delivery capacity')
        else:
            notes.append('Agile delivery team')

        return min(98.0, round(score, 1)), '; '.join(notes)

    def _derive_recommendation(
        self, overall: float, elig: float, cap: float, time_score: float, opp: Opportunity
    ) -> Tuple[str, str]:
        if time_score < 30:
            return 'skip', 'Deadline has expired or provides insufficient time to compile compliant submission.'
        if elig < 50:
            return 'skip', 'Mandatory qualification criteria not met based on verified credentials.'
        if overall >= 88:
            return 'pursue', f"High-probability match ({overall}%). Core capabilities and eligibility strongly align with {opp.organization_name} requirements."
        if overall >= 75:
            return 'review', f"Promising match ({overall}%). Recommended for team review to confirm specific technical compliance."
        if overall >= 60:
            return 'partner', f"Moderate fit ({overall}%). Consider co-bidding or forming a consortium with a prime contractor."
        if overall >= 45:
            return 'watch', f"Low fit ({overall}%). Bookmark to track future revisions or related tenders."
        return 'skip', f"Low alignment ({overall}%) with your current Business DNA profile."

    def explain(self, profile, opp: Opportunity, score: 'OpportunityScore') -> Dict[str, Any]:
        """
        Why/Why Not Engine: returns a human-readable, structured explanation
        of each scoring dimension, top strengths, top gaps, and a narrative summary.
        """
        dimensions = [
            {
                'dimension': 'Eligibility',
                'key': 'eligibility_score',
                'score': score.eligibility_score,
                'weight': self.WEIGHTS['eligibility'],
                'description': 'Mandatory certification and regulatory qualification match.',
                'notes': score.score_metadata.get('eligibility_notes', '') if score.score_metadata else '',
                'icon': 'shield',
            },
            {
                'dimension': 'Business Fit',
                'key': 'business_fit_score',
                'score': score.business_fit_score,
                'weight': self.WEIGHTS['business_fit'],
                'description': 'Industry, sector, and domain alignment.',
                'notes': score.score_metadata.get('business_fit_notes', '') if score.score_metadata else '',
                'icon': 'briefcase',
            },
            {
                'dimension': 'Capability Fit',
                'key': 'capability_fit_score',
                'score': score.capability_fit_score,
                'weight': self.WEIGHTS['capability_fit'],
                'description': 'Technical competency and keyword overlap with requirements.',
                'notes': score.score_metadata.get('capability_notes', '') if score.score_metadata else '',
                'icon': 'zap',
            },
            {
                'dimension': 'Geographic Fit',
                'key': 'geographic_fit_score',
                'score': score.geographic_fit_score,
                'weight': self.WEIGHTS['geographic_fit'],
                'description': 'Location match and cross-border eligibility.',
                'notes': score.score_metadata.get('geographic_notes', '') if score.score_metadata else '',
                'icon': 'map-pin',
            },
            {
                'dimension': 'Value Fit',
                'key': 'value_fit_score',
                'score': score.value_fit_score,
                'weight': self.WEIGHTS['value_fit'],
                'description': 'Contract value vs your preferred deal size range.',
                'notes': score.score_metadata.get('value_notes', '') if score.score_metadata else '',
                'icon': 'dollar-sign',
            },
            {
                'dimension': 'Time Feasibility',
                'key': 'time_feasibility_score',
                'score': score.time_feasibility_score,
                'weight': self.WEIGHTS['time_feasibility'],
                'description': 'Days to deadline vs typical proposal preparation time.',
                'notes': score.score_metadata.get('time_notes', '') if score.score_metadata else '',
                'icon': 'clock',
            },
            {
                'dimension': 'Competition',
                'key': 'competition_score',
                'score': score.competition_score,
                'weight': self.WEIGHTS['competition'],
                'description': 'Estimated competitive density in this category.',
                'notes': score.score_metadata.get('competition_notes', '') if score.score_metadata else '',
                'icon': 'users',
            },
            {
                'dimension': 'Execution Fit',
                'key': 'execution_fit_score',
                'score': score.execution_fit_score,
                'weight': self.WEIGHTS['execution_fit'],
                'description': 'Team size and track record readiness.',
                'notes': score.score_metadata.get('execution_notes', '') if score.score_metadata else '',
                'icon': 'award',
            },
        ]

        # Top 3 strengths: highest-scoring weighted dimensions
        strengths = sorted(
            [d for d in dimensions if (d['score'] or 0) >= 80],
            key=lambda d: (d['score'] or 0) * d['weight'],
            reverse=True
        )[:3]

        # Top 3 gaps: lowest-scoring weighted dimensions
        gaps = sorted(
            [d for d in dimensions if (d['score'] or 0) < 75],
            key=lambda d: (d['score'] or 0) * d['weight']
        )[:3]

        return {
            'overall_score': score.overall_score,
            'recommendation': score.recommendation,
            'recommendation_reason': score.recommendation_reason,
            'dimensions': dimensions,
            'strengths': [{'dimension': d['dimension'], 'score': d['score'], 'notes': d['notes']} for d in strengths],
            'gaps': [{'dimension': d['dimension'], 'score': d['score'], 'notes': d['notes']} for d in gaps],
            'narrative': (
                f"This opportunity scores {score.overall_score}/100 against your Business DNA. "
                + (f"Key strengths: {', '.join(s['dimension'] for s in strengths)}. " if strengths else "")
                + (f"Areas to improve: {', '.join(g['dimension'] for g in gaps)}." if gaps else "")
            ),
        }


scoring_engine = ScoringEngine()

