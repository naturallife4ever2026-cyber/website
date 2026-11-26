# SlumPulse AI

A full-stack civic issue reporting and governance platform.

## Stack
- Frontend: React, Vite, Tailwind CSS, React Router, Lucide
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite for local development; PostgreSQL-ready configuration
- AI: Google Gemini integration will be added in Phase 4

## Requirements
- Node.js 20+
- Python 3.10+
- Git (optional)

## 1. Start the backend (Windows PowerShell)

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
API documentation: http://127.0.0.1:8000/docs

On macOS/Linux, activate with `source .venv/bin/activate`.

## 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173

## 3. Configuration
The backend reads settings from `backend/.env`. The frontend reads `frontend/.env`.
Do not commit real API keys or passwords.

## Project structure

```text
slumpulse-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Development sequence
1. Foundation and dashboard (included)
2. Authentication and role-based access
3. Complaint submission and evidence uploads
4. Gemini-powered analysis and agent workflow
5. GPS maps and duplicate detection
6. Citizen tracking and community support
7. Government operations dashboard
8. Resolution verification, testing and deployment

The initial dashboard uses clearly labelled demonstration data. It is not connected to real government systems.
