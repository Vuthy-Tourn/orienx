import uuid
from datetime import datetime, timezone
from typing import Optional, Any
from sqlalchemy import String, Boolean, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class RecommendationRule(Base):
    __tablename__ = "recommendation_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    weight_personality: Mapped[float] = mapped_column(Numeric(3, 2), default=0.20, nullable=False)
    weight_riasec: Mapped[float] = mapped_column(Numeric(3, 2), default=0.35, nullable=False)
    weight_academic_strengths: Mapped[float] = mapped_column(Numeric(3, 2), default=0.30, nullable=False)
    weight_career_alignment: Mapped[float] = mapped_column(Numeric(3, 2), default=0.15, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    parameters: Mapped[Any] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class MajorRecommendation(Base):
    __tablename__ = "major_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    major_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("majors.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("recommendation_rules.id", ondelete="SET NULL"))
    
    match_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False) # 0.00 to 100.00
    personality_match_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    riasec_match_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    academic_match_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    career_match_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    explanation: Mapped[Any] = mapped_column(JSONB, nullable=False)
    rank_position: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    major: Mapped["Major"] = relationship("Major")

