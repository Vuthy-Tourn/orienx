import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import String, Date, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    full_name_en: Mapped[str] = mapped_column(String(150), nullable=False)
    full_name_km: Mapped[Optional[str]] = mapped_column(String(150))
    phone: Mapped[Optional[str]] = mapped_column(String(30))
    gender: Mapped[Optional[str]] = mapped_column(String(20)) # MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    province: Mapped[str] = mapped_column(String(100), nullable=False, default="Phnom Penh", index=True)
    high_school: Mapped[Optional[str]] = mapped_column(String(200))
    current_education_level: Mapped[str] = mapped_column(String(50), nullable=False, default="GRADE_12", index=True)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer)
    preferred_language: Mapped[str] = mapped_column(String(5), nullable=False, default="km")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="profile")

