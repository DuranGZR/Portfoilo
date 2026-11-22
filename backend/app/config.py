"""
Portfolio Backend Configuration
"""
import json
from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_name: str = "Portfolio API"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001,https://durangezer.com,https://www.durangezer.com,https://durangezer.dev"
    backend_cors_origins: Optional[str] = None
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string or JSON list."""
        raw = self.backend_cors_origins or self.cors_origins
        if not raw:
            return ["*"]
        raw = raw.strip()
        if raw.startswith("[") and raw.endswith("]"):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(o).strip() for o in parsed if str(o).strip()]
            except Exception:
                pass
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./portfolio.db"
    
    # AI - Groq
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.8-27b"
    groq_fallback_models: str = "openai/gpt-oss-120b,openai/gpt-oss-20b"
    chat_timeout_seconds: float = 20
    chat_max_concurrency: int = 4
    chat_requests_per_minute: int = 60
    chat_requests_per_day: int = 1000
    chat_session_ttl_seconds: int = 1800
    chat_max_sessions: int = 500

    @property
    def groq_models_list(self) -> List[str]:
        """Ordered list of primary and fallback Groq models."""
        models = [self.groq_model.strip()]
        for fallback in self.groq_fallback_models.split(","):
            name = fallback.strip()
            if name and name not in models:
                models.append(name)
        return [m for m in models if m]
    
    # Email - Resend
    resend_api_key: str = ""
    contact_email: str = ""
    
    # Admin
    admin_password: str = ""
    admin_password_hash: str = ""
    admin_jwt_secret: str = "portfolio-admin-jwt-secret-key-super-secure"
    admin_api_key: str = ""
    admin_path: str = "ctrl-x7k9p2m"
    
    # Rate Limiting
    rate_limit_per_minute: int = 30
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
