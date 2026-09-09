# AI Opportunity OS

**Discover. Decide. Capture.**

> The intelligence layer for business opportunities.

AI Opportunity OS is a production-grade AI Opportunity Intelligence & Execution Platform that continuously discovers, analyzes, ranks, and helps businesses act on legitimate business opportunities across governments, enterprises, funding programs, procurement, partnerships, exports, innovation programs, grants, accelerators, and research programs.

---

## Monorepo Structure

```
ai-opportunity-os/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router + TypeScript + Tailwind)
│   └── api/          # FastAPI backend (Python + PostgreSQL + Redis)
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker-compose.yml
└── .env.example
```

---

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- Python 3.11+

### 1. Clone & Configure

```bash
git clone <repo>
cd ai-opportunity-os
cp .env.example .env
# Edit .env with your values
```

### 2. Start with Docker Compose

```bash
docker compose up -d
```

Services:
- **Web** → http://localhost:3000
- **API** → http://localhost:8000
- **API Docs** → http://localhost:8000/docs
- **PostgreSQL** → localhost:5432
- **Redis** → localhost:6379
- **MinIO** → http://localhost:9001

### 3. Local Development (without Docker)

**Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

**Backend:**
```bash
cd apps/api
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --reload
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Radix UI |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 |
| Database | PostgreSQL 16 + pgvector |
| Cache / Queue | Redis + Celery |
| Object Storage | MinIO (dev) / S3-compatible (prod) |
| AI | Google Gemini API (abstracted) |
| Auth | JWT + Refresh Tokens |

---

## Environment Variables

See `.env.example` for all required configuration.

---

## Phase Roadmap

- **Phase 1** ✅ Foundation — Design system, landing page, auth, onboarding, app shell
- **Phase 2** 🔄 Opportunity Engine — Ingestion, search, filtering, radar
- **Phase 3** 📋 AI Intelligence — Extraction, matching, scoring, AI Analyst
- **Phase 4** 📋 Execution — Applications, proposals, compliance, documents
- **Phase 5** 📋 Intelligence Network — Partners, Change Radar, analytics
- **Phase 6** 📋 Autonomous Intelligence — Monitoring agents, predictive discovery

---

## Security

- JWT authentication with refresh tokens
- Organization/workspace isolation enforced at DB level
- RBAC for roles within organizations
- Audit logging for all mutations
- Input validation on all endpoints
- Rate limiting on auth routes
- Demo data completely isolated from production data

---

## License

Proprietary — All rights reserved.
