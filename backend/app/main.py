"""
Portfolio Backend - FastAPI Application
"""
import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.api.v1.router import api_router
from app.core.security import limiter
from app.db.database import create_tables
from app.services.ai_service import close_client
from app.services.chat_sessions import cleanup_conversations


async def rate_limit_exceeded(request, error):
    response = _rate_limit_exceeded_handler(request, error)
    response.headers['Retry-After'] = '60'
    response.headers['Cache-Control'] = 'no-store'
    return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await create_tables()
    print(f"🚀 {settings.app_name} started")
    print(f"📚 API docs: http://{settings.host}:{settings.port}/docs")
    cleanup = asyncio.create_task(cleanup_conversations())
    try:
        yield
    finally:
        cleanup.cancel()
        with suppress(asyncio.CancelledError):
            await cleanup
        await close_client()
    print(f"👋 {settings.app_name} shutting down")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        description="AI Engineer Portfolio Backend API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan
    )
    
    # Rate Limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded)
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=['Retry-After'],
    )
    
    # Include API router
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
