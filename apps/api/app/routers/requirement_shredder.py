from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.opportunity import Opportunity
from app.models.application import Application
from app.services.ai_service import ai_service
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid
import re

router = APIRouter()


class ShredderRequest(BaseModel):
    text: Optional[str] = None           # Raw RFP text to parse
    opportunity_id: Optional[str] = None  # Or auto-extract from an opportunity


def _extract_requirements_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Structured requirement extraction from raw RFP/tender text.
    Detects numbered lists, bullet points, 'shall'/'must'/'required' sentences.
    No AI dependency — works deterministically for guaranteed results.
    """
    requirements = []
    req_id = 1

    # Pattern 1: Numbered items (1. / 1) / (1) etc.)
    numbered = re.findall(r'(?:^|\n)\s*(?:\(?\d+[\.\)]\s+)(.+?)(?=\n|$)', text, re.MULTILINE)

    # Pattern 2: Bullet points
    bullets = re.findall(r'(?:^|\n)\s*[•\-\*]\s+(.+?)(?=\n|$)', text, re.MULTILINE)

    # Pattern 3: Sentences with mandatory keywords
    mandatory_pattern = re.compile(
        r'([A-Z][^.!?]*(?:shall|must|required|mandatory|obligatory|compulsory)[^.!?]*[.!?])',
        re.IGNORECASE
    )
    mandatory_sentences = mandatory_pattern.findall(text)

    # Categorize by keywords
    def _categorize(req_text: str) -> str:
        t = req_text.lower()
        if any(k in t for k in ['iso', 'certif', 'registr', 'license', 'accredit', 'msme', 'udyam', 'gstin', 'pan']):
            return 'certification'
        if any(k in t for k in ['financial', 'turnover', 'revenue', 'balance sheet', 'audit', 'tax']):
            return 'financial'
        if any(k in t for k in ['experience', 'track record', 'project', 'client', 'reference', 'past']):
            return 'experience'
        if any(k in t for k in ['technical', 'technology', 'software', 'hardware', 'system', 'platform', 'cloud']):
            return 'technical'
        if any(k in t for k in ['team', 'manpower', 'staff', 'resource', 'key personnel', 'expert']):
            return 'team'
        if any(k in t for k in ['document', 'submit', 'furnish', 'provide', 'attach', 'enclose']):
            return 'documentation'
        return 'general'

    def _is_mandatory(req_text: str) -> bool:
        t = req_text.lower()
        return any(k in t for k in ['shall', 'must', 'mandatory', 'required', 'compulsory', 'obligatory'])

    def _evidence_needed(req_text: str) -> str:
        t = req_text.lower()
        if 'iso' in t:
            return 'ISO Certificate'
        if 'msme' in t or 'udyam' in t:
            return 'MSME/Udyam Registration'
        if 'financial' in t or 'turnover' in t:
            return 'Audited Financial Statements'
        if 'experience' in t or 'track record' in t:
            return 'Project Completion Certificates'
        if 'tax' in t or 'gst' in t:
            return 'Tax Registration & Returns'
        if 'incorporat' in t or 'registr' in t:
            return 'Certificate of Incorporation'
        return 'Supporting Document'

    seen = set()
    all_reqs = list(numbered) + list(bullets) + list(mandatory_sentences)

    for req_text in all_reqs:
        req_text = req_text.strip()
        if len(req_text) < 10 or req_text.lower() in seen:
            continue
        seen.add(req_text.lower())

        requirements.append({
            'id': f'REQ-{req_id:03d}',
            'requirement_text': req_text,
            'category': _categorize(req_text),
            'mandatory': _is_mandatory(req_text),
            'evidence_needed': _evidence_needed(req_text),
            'status': 'pending',
            'owner': None,
            'evidence_document_id': None,
            'notes': '',
        })
        req_id += 1

        if req_id > 50:  # Cap at 50 requirements
            break

    return requirements


@router.post('/extract')
async def extract_requirements(
    data: ShredderRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Requirement Shredder: extracts structured requirements from raw RFP text
    or auto-populates from an existing opportunity's description/requirements.
    
    Stores extracted requirements in the application's extracted_requirements field
    if opportunity_id is provided and an application exists.
    """
    source_text = ''

    if data.opportunity_id:
        try:
            opp_id = uuid.UUID(data.opportunity_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid opportunity_id")

        opp_r = await db.execute(select(Opportunity).where(Opportunity.id == opp_id))
        opp = opp_r.scalar_one_or_none()
        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found")

        # Build source text from opportunity fields
        parts = []
        if opp.description:
            parts.append(opp.description)
        if opp.requirements:
            if isinstance(opp.requirements, list):
                parts.extend([str(r) for r in opp.requirements])
            else:
                parts.append(str(opp.requirements))
        if opp.eligibility_criteria:
            if isinstance(opp.eligibility_criteria, list):
                parts.extend([str(c) for c in opp.eligibility_criteria])
            else:
                parts.append(str(opp.eligibility_criteria))
        source_text = '\n'.join(parts)
    
    if data.text:
        source_text = data.text + '\n' + source_text

    if not source_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Provide either 'text' (raw RFP text) or 'opportunity_id' to extract requirements from."
        )

    # Extract requirements
    requirements = _extract_requirements_from_text(source_text)

    # If no requirements found via patterns, create generic ones from the text
    if not requirements:
        lines = [l.strip() for l in source_text.split('\n') if len(l.strip()) > 20][:10]
        for i, line in enumerate(lines):
            requirements.append({
                'id': f'REQ-{i+1:03d}',
                'requirement_text': line,
                'category': 'general',
                'mandatory': False,
                'evidence_needed': 'Supporting Document',
                'status': 'pending',
                'owner': None,
                'evidence_document_id': None,
                'notes': '',
            })

    return {
        'requirements': requirements,
        'total': len(requirements),
        'mandatory_count': sum(1 for r in requirements if r['mandatory']),
        'categories': list(set(r['category'] for r in requirements)),
        'source': 'opportunity' if data.opportunity_id and not data.text else 'text',
    }


@router.post('/application/{application_id}/store')
async def store_requirements(
    application_id: uuid.UUID,
    data: ShredderRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Extract and store requirements directly in an application record."""
    app_r = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.organization_id == org.id
        )
    )
    app = app_r.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Build text from application's opportunity
    opp_r = await db.execute(select(Opportunity).where(Opportunity.id == app.opportunity_id))
    opp = opp_r.scalar_one_or_none()

    source_text = data.text or ''
    if opp:
        parts = [opp.description or '']
        if opp.requirements and isinstance(opp.requirements, list):
            parts.extend([str(r) for r in opp.requirements])
        if opp.eligibility_criteria and isinstance(opp.eligibility_criteria, list):
            parts.extend([str(c) for c in opp.eligibility_criteria])
        source_text = '\n'.join(parts) + '\n' + source_text

    requirements = _extract_requirements_from_text(source_text)

    app.extracted_requirements = requirements
    await db.commit()

    return {'stored': True, 'total': len(requirements)}
