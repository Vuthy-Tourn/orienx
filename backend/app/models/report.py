import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SharedReport(Base):
    __tablename__ = "shared_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    audience: Mapped[str] = mapped_column(
        String(20), default="PARENT", nullable=False
    )
    language: Mapped[str] = mapped_column(
        String(5), default="en", nullable=False
    )
    sections: Mapped[List[str]] = mapped_column(
        JSONB, nullable=False, default=list
    )
    note: Mapped[Optional[str]] = mapped_column(Text)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )
    view_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    last_viewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
