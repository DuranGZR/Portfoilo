# Duran Gezer — AI Engineering Portfolio

A Turkish and English portfolio for AI systems, backend services and mobile projects, built with Next.js and FastAPI.

## What is included

- Dark theme on the first visit, with the visitor’s theme preference remembered.
- A cursor-responsive ASCII cloth hero on desktop and an ASCII mascot introduction.
- A manually controlled project gallery and simpler project detail pages.
- Current project, education and experience information across the website and 3D resume.
- An AI portfolio assistant with shared conversation history between the page and floating mascot.
- Progressive mascot replies with synthesized speech sounds, mute controls and synchronized mouth animation.
- Keyboard navigation, accessible controls, reduced-motion handling and mobile layouts.

## Stack

| Area | Technology |
| --- | --- |
| Website | Next.js 16, React 19, TypeScript, Tailwind CSS, next-intl |
| Motion and 3D | Framer Motion, Three.js, React Three Fiber |
| API | FastAPI, Pydantic, SQLAlchemy |
| Assistant | Async Groq SDK, owner-approved JSON profile, configured model fallbacks |

## Run locally

Requirements: Node.js 20.9+ and Python 3.11+.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Set GROQ_API_KEY and any other required values in .env.
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

Then run:

```powershell
cd frontend
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [Turkish](http://127.0.0.1:3000/tr) or [English](http://127.0.0.1:3000/en). The AI assistant requires a valid server-side Groq key; it reports service errors when the provider is unavailable or rate-limited.

## Assistant behavior and limits

The assistant uses `backend/app/data/knowledge_base.json` as its approved profile. Visitor messages cannot update that file. It has no browsing, filesystem or command-execution tools, and receives no server API keys.

Conversations use separate anonymous owner credentials and server-generated session IDs. The API limits message length, session capacity, provider calls and concurrent requests. Clear and disconnect operations cancel active model work; output links are checked against the approved profile.

The current conversation store and budgets are process-local: run one backend worker. Shared storage is required before adding workers or replicas. Prompt safeguards reduce risk but do not guarantee perfect answers or immunity to prompt injection. See the [backend operation guide](backend/README.md#ai-chat-operation).

## Validation

```powershell
# Backend
cd backend
python -m unittest discover -s tests -v

# Frontend, from frontend/
npx tsc --noEmit
npm run build
npm audit
```

Optional real-provider checks are documented in the backend guide. They consume Groq quota and are not part of automatic unit tests.

## Repository layout

- `frontend/` — website, project content, 3D resume and public assets.
- `backend/app/` — API, approved assistant profile and services.
- `backend/tests/` — regression tests and explicit live evaluation cases.

Environment files, local databases, generated agent instructions, browser recordings and `output/` artifacts are excluded from Git. Local planning and deployment notes are kept outside the published repository.

## Author and license

Duran Gezer · [GitHub](https://github.com/DuranGZR) · [LinkedIn](https://linkedin.com/in/durangezer)

MIT License © 2024–2026 Duran Gezer
