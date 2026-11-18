import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.config import settings
from app.core.database import get_db, Base


@pytest.fixture(autouse=True)
def no_ai_daily_limits(monkeypatch):
    """AI tests should not fail just because the dev database has had a busy day."""
    monkeypatch.setattr(settings, "AI_DAILY_QUESTION_LIMIT", 100000)
    monkeypatch.setattr(settings, "ASSISTANT_DAILY_QUESTION_LIMIT", 100000)


@pytest_asyncio.fixture(scope="session")
async def db_session():
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

