from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "OrienX API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://futera_user:futera_password@127.0.0.1:5433/futera_db"
    
    # Security & JWT
    SECRET_KEY: str = "futera_super_secret_jwt_signing_key_change_in_production_2026_education"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Browser session cookies (same-origin through the Next.js proxy)
    COOKIE_SECURE: bool = False  # set true in HTTPS production
    COOKIE_SAMESITE: str = "lax"
    ACCESS_COOKIE_NAME: str = "futera_access_token"
    ACCESS_COOKIE_PATH: str = "/api/v1"
    REFRESH_COOKIE_NAME: str = "futera_refresh_token"
    REFRESH_COOKIE_PATH: str = "/api/v1/auth"
    SESSION_HINT_COOKIE_NAME: str = "futera_session"
    SESSION_HINT_COOKIE_PATH: str = "/"
    
    # Admin content uploads (logos, covers, major images, posters)
    UPLOAD_DIR: str = str(Path(__file__).resolve().parents[2] / "uploads")
    MAX_UPLOAD_MB: int = 5

    # Password recovery. Set PASSWORD_RESET_DEBUG=false once email delivery
    # is configured; when true the reset link is returned to the client and
    # logged so the flow can be exercised locally.
    FRONTEND_URL: str = "http://localhost:3000"
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    PASSWORD_RESET_DEBUG: bool = True

    # Local AI advisor (zero-cost). Uses Ollama on the developer's machine when
    # it is running; otherwise the API answers directly from verified database
    # records. No paid API keys are required.
    AI_ADVISOR_ENABLED: bool = True
    AI_OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    AI_OLLAMA_MODEL: str = ""  # empty = auto-detect an installed chat model
    AI_OLLAMA_TIMEOUT_SECONDS: float = 45.0
    AI_OLLAMA_KEEP_ALIVE: str = "2h"
    AI_MAX_CONTEXT_CHARS: int = 3500
    AI_MAX_CONTEXT_DOCS: int = 4
    AI_MAX_OUTPUT_TOKENS: int = 180
    AI_DAILY_QUESTION_LIMIT: int = 80

    # Hybrid retrieval: local embeddings (Ollama) + pgvector, combined with the
    # existing keyword scorer. Falls back to keyword-only if embeddings are
    # unavailable.
    AI_EMBEDDING_MODEL: str = "bge-m3"
    AI_EMBEDDING_TIMEOUT_SECONDS: float = 60.0
    AI_HYBRID_RETRIEVAL: bool = True
    AI_VECTOR_MIN_SIMILARITY: float = 0.30
    AI_TOOLS_ENABLED: bool = True

    # Telegram deadline reminders
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_BOT_USERNAME: str = ""
    TELEGRAM_LINK_EXPIRE_MINUTES: int = 15
    TELEGRAM_POLL_INTERVAL_SECONDS: int = 4
    TELEGRAM_REMINDER_INTERVAL_SECONDS: int = 300

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()

