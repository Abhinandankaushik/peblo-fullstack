# Peblo — Collaborative AI Notes Workspace

A lightweight full-stack notes app with authentication, tags, AI summaries
(summary + action items + suggested title), search/filter, public sharing,
and a productivity insights dashboard.

## Stack
- **Frontend:** React 18 + Vite + React Router + Tailwind CSS
- **Backend:** Node.js + Express + better-sqlite3 + JWT auth + bcrypt
- **AI:** OpenAI Chat Completions (any OpenAI-compatible endpoint works)
- **DB:** SQLite (file-based, zero setup)

## Architecture
```
backend/   Express REST API, SQLite store, JWT middleware, OpenAI client
frontend/  Vite SPA, JWT in localStorage, protected routes, optimistic UI
```

Single-tenant schema:
- `users(id, name, email, password_hash)`
- `notes(id, user_id, title, content, tags, category, archived, share_id, ai_uses, created_at, updated_at)`

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env       # fill JWT_SECRET and OPENAI_API_KEY
npm install
npm run dev                # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:4000
npm install
npm run dev                # http://localhost:5173
```

### 3. Test
1. Sign up at `/signup`, then log in.
2. Create a note, add tags, edit (auto-saves on blur / debounce).
3. Click **Generate AI** to get summary + action items + suggested title.
4. Use the search bar and tag filter on the dashboard.
5. Click **Share** to copy a public `/s/:shareId` link — open in incognito.
6. Visit **Insights** for totals, recent notes, top tags, AI usage, weekly activity.

## Endpoints
```
POST  /auth/signup            { name, email, password }
POST  /auth/login             { email, password }
GET   /notes?q=&tag=          (auth)
POST  /notes                  (auth)
GET   /notes/:id              (auth)
PATCH /notes/:id              (auth)
DELETE /notes/:id             (auth)
POST  /notes/:id/generate     (auth)  -> { summary, action_items, suggested_title }
POST  /notes/:id/share        (auth)  -> { share_id, url }
DELETE /notes/:id/share       (auth)
GET   /shared/:shareId        (public)
GET   /insights               (auth)
```

## Notes on AI
If `OPENAI_API_KEY` is unset, the `/generate` endpoint returns a deterministic
mock so the UI is fully testable offline.

## Security
- Passwords hashed with bcrypt (10 rounds)
- JWT signed with `JWT_SECRET`, 7-day expiry
- All `/notes/*` and `/insights` routes require `Authorization: Bearer <token>`
- Public share routes only return notes with a non-null `share_id`
- `.env` is gitignored; `.env.example` documents required vars
