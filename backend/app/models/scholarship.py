import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Any
from sqlalchemy import String, Boolean, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ScholarshipMajor(Base):
    __tablename__ = "scholarship_majors"

    scholarship_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("scholarships.id", ondelete="CASCADE"), primary_key=True)
    major_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("majors.id", ondelete="CASCADE"), primary_key=True)


class Scholarship(Base):
    __tablename__ = "scholarships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    title: Mapped[Any] = mapped_column(JSONB, nullable=False)
    provider: Mapped[Any] = mapped_column(JSONB, nullable=False)
    description: Mapped[Any] = mapped_column(JSONB, nullable=False)
    eligibility_criteria: Mapped[Any] = mapped_column(JSONB, nullable=False)
    academic_requirements: Mapped[Optional[Any]] = mapped_column(JSONB)
    coverage_type: Mapped[str] = mapped_column(String(50), nullable=False) # FULL_TUITION, PARTIAL_TUITION, STIPEND_ONLY, FULL_RIDE
    coverage_percentage: Mapped[Optional[int]] = mapped_column(Integer)
    country_or_institution: Mapped[str] = mapped_column(String(100), nullable=False)
    application_deadline: Mapped[Optional[date]] = mapped_column(Date, index=True)
    application_process: Mapped[Any] = mapped_column(JSONB, nullable=False)
    official_url: Mapped[str] = mapped_column(String(500), nullable=False)
    source_name: Mapped[Optional[str]] = mapped_column(String(150))
    last_verified_at: Mapped[Optional[date]] = mapped_column(Date)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    eligible_majors: Mapped[List["Major"]] = relationship("Major", secondary="scholarship_majors")

