from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine
from app.models import Complaint  # noqa: F401
from app.api.routes.complaints import router as complaints_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)

@app.get("/api/health")
def health():
    return {"status": "ok", "application": settings.app_name}

@app.get("/")
def root():
    return {"message": "Welcome to SlumPulse AI API", "docs": "/docs"}
