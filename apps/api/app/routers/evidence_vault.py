from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.evidence_document import EvidenceDocument
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter()


class EvidenceDocumentCreate(BaseModel):
    title: str
    document_type: str = "certificate"
    file_url: Optional[str] = None
    expiry_date: Optional[str] = None  # ISO date string
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class EvidenceDocumentResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    document_type: str
    file_url: Optional[str] = None
    expiry_date: Optional[str] = None
    is_expired: Optional[bool] = False
    tags: Optional[List[str]] = None
    used_in_applications: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


def _to_response(doc: EvidenceDocument) -> dict:
    return {
        'id': str(doc.id),
        'organization_id': str(doc.organization_id),
        'title': doc.title,
        'document_type': doc.document_type,
        'file_url': doc.file_url,
        'expiry_date': doc.expiry_date.isoformat() if doc.expiry_date else None,
        'is_expired': doc.is_expired,
        'tags': doc.tags,
        'used_in_applications': doc.used_in_applications,
        'notes': doc.notes,
        'created_at': doc.created_at.isoformat() if doc.created_at else None,
        'updated_at': doc.updated_at.isoformat() if doc.updated_at else None,
    }


@router.get('', response_model=List[Dict[str, Any]])
@router.get('/', response_model=List[Dict[str, Any]])
async def list_evidence(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """List all evidence documents for this organization."""
    result = await db.execute(
        select(EvidenceDocument)
        .where(EvidenceDocument.organization_id == org.id)
        .order_by(EvidenceDocument.created_at.desc())
    )
    docs = result.scalars().all()

    # Auto-update is_expired status
    now = datetime.now(timezone.utc)
    for doc in docs:
        if doc.expiry_date:
            expiry = doc.expiry_date if doc.expiry_date.tzinfo else doc.expiry_date.replace(tzinfo=timezone.utc)
            if expiry < now and not doc.is_expired:
                doc.is_expired = True

    return [_to_response(d) for d in docs]


@router.post('', response_model=Dict[str, Any])
@router.post('/', response_model=Dict[str, Any])
async def create_evidence(
    data: EvidenceDocumentCreate,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Add a new evidence document to the vault."""
    expiry_dt = None
    if data.expiry_date:
        try:
            expiry_dt = datetime.fromisoformat(data.expiry_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid expiry_date format. Use ISO 8601.")

    doc = EvidenceDocument(
        organization_id=org.id,
        title=data.title,
        document_type=data.document_type,
        file_url=data.file_url,
        expiry_date=expiry_dt,
        is_expired=False,
        tags=data.tags,
        notes=data.notes,
        used_in_applications=[],
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return _to_response(doc)


@router.get('/expiring', response_model=List[Dict[str, Any]])
async def get_expiring_documents(
    days: int = Query(60, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """List documents expiring within the specified number of days."""
    now = datetime.now(timezone.utc)
    threshold = now + timedelta(days=days)
    result = await db.execute(
        select(EvidenceDocument).where(
            and_(
                EvidenceDocument.organization_id == org.id,
                EvidenceDocument.expiry_date != None,
                EvidenceDocument.expiry_date <= threshold,
                EvidenceDocument.is_expired == False,
            )
        ).order_by(EvidenceDocument.expiry_date.asc())
    )
    return [_to_response(d) for d in result.scalars().all()]


@router.delete('/{id}')
async def delete_evidence(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: AsyncSession = Depends(get_db)
):
    """Delete an evidence document from the vault."""
    result = await db.execute(
        select(EvidenceDocument).where(
            and_(EvidenceDocument.id == id, EvidenceDocument.organization_id == org.id)
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return {'message': 'Deleted', 'success': True}
