from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ComplaintCreate(BaseModel):
    title: str
    description: str = ""
    category: str = "Other"
    priority: str = "Medium"
    location_text: str = ""
    latitude: float | None = None
    longitude: float | None = None

class ComplaintOut(BaseModel):
    id: int
    public_id: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    location_text: str
    latitude: float | None
    longitude: float | None
    image_url: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
