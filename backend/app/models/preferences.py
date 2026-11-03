import uuid
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import String, Boolean, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class AcademicPreferences(Base):
    __tablename__ = "academic_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    favorite_subjects: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list) # ["Mathematics", "Informatics"]
    strongest_subjects: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list) # ["Mathematics", "Physics"]
    enjoyed_activities: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list)
    preferred_work_environments: Mapped[Optional[Any]] = mapped_column(JSONB)
    preferred_learning_style: Mapped[Optional[str]] = mapped_column(String(50))
    career_interest_areas: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list)
    preferred_locations: Mapped[Any] = mapped_column(JSONB, nullable=False, default=list) # ["Phnom Penh"]
    annual_tuition_budget_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    requires_scholarship: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

