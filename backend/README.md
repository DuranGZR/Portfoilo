# FastAPI Backend Service

Production-ready backend service for the AI Engineer Portfolio, powering the AI assistant, contact form, and analytics.

## 🚀 Features

- **🤖 AI Assistant** - Async Groq client with configured model fallbacks and an owner-approved profile
- **📧 Contact System** - Email delivery via **Resend**
- **📊 Analytics** - Privacy-friendly page view tracking
- **🛡️ Security** - Rate limiting and CORS configuration
- **⚡ Performance** - Async/await architecture

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **AI**: Async Groq SDK (models configured through environment variables)
- **Validation**: Pydantic v2
- **Email**: Resend SDK

## ⚡ Quick Start

### 1. Setup Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file in the `backend` directory:

```env
# === AI Service (REQUIRED) ===
GROQ_API_KEY=gsk_your_key_here

# === Email Service (Optional) ===
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=onboarding@resend.dev
EMAIL_TO=contact@durangezer.com

# === Security ===
SECRET_KEY=your_secret_key_here
BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://durangezer.com"]
```

### 4. Run Server

```bash
# Development (Auto-reload)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once the server is running, meaningful documentation is automatically generated:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🔌 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/chat` | AI Chat completion |
| `POST` | `/api/v1/contact` | Send contact email |
| `GET` | `/api/v1/analytics` | Track page views |
| `GET` | `/api/v1/health` | Health check probe |

## 🧠 AI Configuration

The AI service is configured in `app/services/ai_service.py`.
- **Models**: `GROQ_MODEL` and `GROQ_FALLBACK_MODELS` configure the primary and fallback models.
- **Context**: Loads from `app/data/knowledge_base.json`
- **Prompt**: Uses a specialized system prompt for third-person responses.

## 📦 Deployment

**Docker Build:**

```bash
docker build -t portfolio-backend .
docker run -p 8000:8000 --env-file .env portfolio-backend
```

## 📄 License

MIT © Duran Gezer


## AI chat operation

Run one Uvicorn worker with the current process-local conversation store and limits (the Dockerfile already does this). Before adding workers or replicas, move session ownership/history, provider cooldowns, and usage counters into shared storage. Conversations intentionally do not persist across restarts. History holds at most 10 messages; the frontend shows at most 40.

`POST /api/v1/chat` requires `X-Chat-Client`, a cryptographically random 64-character lowercase hexadecimal owner credential held only in browser memory. Send `{message, locale: "tr" | "en", session_id?}`. The server generates a separate session ID and binds it to the owner credential. Do not log or persist owner credentials in analytics. The shared frontend provider supplies them for both chat interfaces.

`POST /api/v1/chat/reset` with the same header deletes the specified session; `{session_id: null}` deletes all sessions belonging to that anonymous owner, including a first request whose session ID has not returned yet. Deletion cancels active model work. Disconnecting the chat request also cancels its model task. A completed provider response may already have consumed quota before cancellation arrives.

Errors return non-success HTTP status codes and a stable `detail.code`; rate limits include `Retry-After`. Frontend requests have a 25-second limit; the backend has a 20-second total deadline, 8-second per-provider timeout and no automatic SDK retries. Model-specific rate-limit cooldowns prevent repeated immediate calls to unavailable models. IP rate limiting is supplemented by concurrency, minute/day provider-call budgets, and bounded session capacity. These budgets count every provider attempt, including failed fallbacks, and reset on process restart.

The approved profile is read from `app/data/knowledge_base.json` for each request. Core facts and all current project summaries remain available; named projects get their full details. Older projects are included when asked for. The model has no filesystem, browsing or execution tools, and receives no server credentials. Output links must match the approved profile exactly. This reduces risk but does not guarantee immunity to prompt injection or factual mistakes.

Application logs record model, status, duration, and token usage, without prompts, answers, session IDs or owner credentials. Expired conversations are swept every 15 seconds after 30 minutes of inactivity by default. Keep Groq data-retention/account settings under the operator's control; local deletion cannot delete data already processed by the provider.

Validation:

```powershell
python -m unittest discover -s tests -v
# Optional: consumes Groq quota; review responses rather than counting errors as blocked attacks.
python tests/evaluate_ai.py --live
```

Live evaluation cases are maintained in `tests/ai_eval_cases.json`; results go to `../output/ai-evaluation-current.json`. Do not run live evaluation automatically on every build.
