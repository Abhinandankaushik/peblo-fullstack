# Peblo — Collaborative AI Notes Workspace

Peblo is a lightweight full-stack notes app that helps users capture ideas,
generate concise AI summaries and action items, tag and share notes publicly,
and view simple productivity insights.

Features
- User signup/login (JWT)
- Create, edit, delete, archive notes
- Tags and tag filtering
- AI-generated summary, action items, and suggested title per note
- Public share links for read-only notes
- Insights dashboard (recent edits, top tags, weekly activity)

Tech stack
- Frontend: React 18, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express
- DB: Postgres (configured via `DATABASE_URL`) — repository includes SQL schema
- Auth: bcrypt for password hashing, JWT for session tokens
- AI: OpenAI or Gemini-compatible client (configurable via env)

Repository layout
- `backend/` — Express API, routes, controllers, models, AI integration
- `frontend/` — Vite React app, pages and components
- `docker-compose.yml` — development container orchestration

Required environment variables
- `PORT` — backend listen port (default 4000)
- `DATABASE_URL` — Postgres connection string (or change to SQLite if preferred)
- `JWT_SECRET` — secret used to sign JWTs (keep secret, use strong random value)
- `OPENAI_API_KEY` — OpenAI API key (optional if using Gemini)
- `GEMINI_API_KEY` — Google Gemini key (optional)
- `OPENAI_MODEL` / `GEMINI_MODEL` — model ids (optional)
- `VITE_API_URL` — frontend API base URL (e.g. `http://localhost:4000`)
- `CORS_ORIGIN` — allowed origin for frontend during development (optional)

Ports used
- Backend: `4000` (default) — set via `PORT`
- Frontend: `5173` (Vite dev server)

Quick start (local, non-docker)
1) Backend
```bash
cd backend
cp .env.example .env    # fill JWT_SECRET and DB/API keys
npm install
npm run dev
```

2) Frontend
```bash
cd frontend
cp .env.example .env    # set VITE_API_URL to backend URL
npm install
npm run dev
```

API endpoints (summary)
- POST `/auth/signup`        — body: { name, email, password }
- POST `/auth/login`         — body: { email, password }
- GET  `/notes`              — auth required, query: `q`, `tag`, `archived`
- POST `/notes`              — auth required, create note
- GET  `/notes/:id`          — auth required, get note
- PATCH `/notes/:id`         — auth required, partial update
- DELETE `/notes/:id`        — auth required, delete note
- POST `/notes/:id/generate` — auth required, call AI to generate summary
- POST `/notes/:id/share`    — auth required, create share id
- DELETE `/notes/:id/share`  — auth required, remove share id
- GET  `/shared/:shareId`    — public, read-only view
- GET  `/insights`           — auth required, user insights

AI behavior
- `backend/src/ai.js` builds a JSON-only prompt and calls configured AI.
- If no AI key is set, the server provides a deterministic mock for dev/test.

Notes & recommendations
- Database: repository currently uses Postgres via `pg`. If you prefer
	a zero-dependency setup, consider switching to SQLite and updating
	`backend/src/db.js` and `package.json` accordingly.
- Security: keep `JWT_SECRET` and API keys out of git. Use strong secrets.
- Tests: add unit tests for controllers/models and integration tests for auth
	and notes flows. Add CI to run tests on push/PRs.

Docker
- `docker-compose.yml` can run frontend, backend, and a Postgres service.
	Update `.env` values and build with `docker compose up --build`.

Acceptance checklist (before merging)
- All tests pass
- Lint/format applied
- Environment variables documented in `.env.example`
- AI key behavior tested (mock vs live)
- Sharing tested in an incognito window

Contributing
- See the `backend/` and `frontend/` folders for implementation details.
	If you want me to implement tasks from the prompts file, tell me which
	items to prioritize (e.g., DB choice, AI mock, Docker polish, tests).

---
Updated README: concise project analysis, setup, env, endpoints, and notes.
