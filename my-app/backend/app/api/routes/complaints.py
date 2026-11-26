from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintOut

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

@router.get("", response_model=list[ComplaintOut])
def list_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()

@router.post("", response_model=ComplaintOut, status_code=201)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Complaint title is required")
    complaint = Complaint(
        public_id=f"SP-{uuid4().hex[:8].upper()}",
        **payload.model_dump()
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint
