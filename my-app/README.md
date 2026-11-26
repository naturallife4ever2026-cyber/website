# SlumPulse AI — Government Portal MVP

A beginner-friendly full-stack civic issue management application.

## Stack
- Frontend: React + Vite + plain CSS
- Backend: Node.js + Express
- Database: SQLite + Prisma (easy local setup; can migrate to PostgreSQL)
- AI: Google Gemini using the official `@google/genai` SDK
- Authentication: JWT + bcrypt
- Uploads: Multer (local uploads for development)

## Requirements
- Node.js 22+
- npm
- Google Gemini API key (optional; the app works in demo mode without it)

## 1. Configure the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then edit it:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-this-with-a-long-random-secret"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
CLIENT_URL="http://localhost:5173"
```

Generate Prisma Client, create the SQLite database, and seed demo records:

```bash
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Backend runs at http://localhost:5000. API health check: http://localhost:5000/api/health

Demo administrator:
- Email: `admin@slumpulse.ai`
- Password: `Admin@123`

Change this password before using the app outside local development.

## 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Open http://localhost:5173 and sign in using the demo credentials.

## 3. Enable real Gemini analysis

1. Create an API key in Google AI Studio: https://aistudio.google.com/app/apikey
2. Put it in `backend/.env` as `GEMINI_API_KEY=...`.
3. Restart the backend.
4. Open a complaint, optionally attach a JPG/PNG/WebP evidence image (up to 5 MB), then use **Run AI verification**.

If the key is absent, the backend returns a clearly labelled demo analysis. The UI displays whether the result came from Gemini or demo mode.

## 4. Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/dashboard/summary` | Dashboard statistics |
| GET | `/api/complaints` | List/search/filter complaints |
| GET | `/api/complaints/:id` | Complaint details |
| PATCH | `/api/complaints/:id` | Update status, priority, department |
| POST | `/api/complaints/:id/analyze` | Gemini image/text analysis |
| GET | `/api/departments` | List departments |

All complaint and dashboard endpoints require `Authorization: Bearer <token>`.

## 5. Project structure

```text
slumpulse-ai/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── middleware/auth.js
│   │   ├── routes/auth.js
│   │   ├── routes/complaints.js
│   │   ├── routes/dashboard.js
│   │   ├── services/gemini.js
│   │   ├── prisma.js
│   │   └── server.js
│   ├── uploads/
│   ├── seed.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    └── package.json
```

## 6. Notes before production

This is a local development MVP, not a production-ready government deployment. Before production:
- Replace the demo admin credentials and use managed user provisioning.
- Use PostgreSQL, private object storage, HTTPS, rate limiting, audit logs and backups.
- Add role-based permissions for administrators, departments and field workers.
- Validate and scan uploaded files; add file size/type limits and retention policies.
- Add GPS verification using trusted geospatial data; an image alone cannot prove a location.
- Treat AI classifications, confidence and priority as suggestions. Require human review for consequential decisions.
- Add duplicate detection using geospatial proximity and embeddings; the current MVP uses a simple text similarity heuristic.
- Configure CORS, secrets, logging, monitoring and privacy notices for your deployment.
