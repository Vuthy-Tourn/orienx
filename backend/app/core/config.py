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

