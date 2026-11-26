from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from app.db.session import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(24), unique=True, index=True, nullable=False)
    title = Column(String(180), nullable=False)
    description = Column(Text, default="")
    category = Column(String(80), nullable=False, default="Other")
    priority = Column(String(20), nullable=False, default="Medium")
    status = Column(String(40), nullable=False, default="Submitted")
    location_text = Column(String(255), default="")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
