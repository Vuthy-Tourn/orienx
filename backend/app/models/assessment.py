import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlalchemy import String, Boolean, Integer, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


# --- PERSONALITY ASSESSMENT (MBTI-INSPIRED DIMENSIONS) ---

class PersonalityQuestion(Base):
    __tablename__ = "personality_questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dimension: Mapped[str] = mapped_column(String(2), nullable=False) # 'EI', 'SN', 'TF', 'JP'
    prompt_en: Mapped[str] = mapped_column(Text, nullable=False)
    prompt_km: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    options: Mapped[List["PersonalityOption"]] = relationship("PersonalityOption", back_populates="question", cascade="all, delete-orphan", order_by="PersonalityOption.order_index")


class PersonalityOption(Base):
    __tablename__ = "personality_options"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("personality_questions.id", ondelete="CASCADE"), nullable=False)
    label_en: Mapped[str] = mapped_column(Text, nullable=False)
    label_km: Mapped[str] = mapped_column(Text, nullable=False)
    target_trait: Mapped[str] = mapped_column(String(1), nullable=False) # 'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'
    weight: Mapped[float] = mapped_column(Numeric(3, 2), default=1.00, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    question: Mapped["PersonalityQuestion"] = relationship("PersonalityQuestion", back_populates="options")


class PersonalityAssessment(Base):
    __tablename__ = "personality_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="IN_PROGRESS", nullable=False) # IN_PROGRESS, COMPLETED
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    answers: Mapped[List["PersonalityAnswer"]] = relationship("PersonalityAnswer", back_populates="assessment", cascade="all, delete-orphan")
    result: Mapped[Optional["PersonalityResult"]] = relationship("PersonalityResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class PersonalityAnswer(Base):
    __tablename__ = "personality_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("personality_assessments.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("personality_questions.id", ondelete="RESTRICT"), nullable=False)
    selected_option_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("personality_options.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment: Mapped["PersonalityAssessment"] = relationship("PersonalityAssessment", back_populates="answers")
    question: Mapped["PersonalityQuestion"] = relationship("PersonalityQuestion")
    selected_option: Mapped["PersonalityOption"] = relationship("PersonalityOption")


class PersonalityResult(Base):
    __tablename__ = "personality_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("personality_assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    personality_type: Mapped[str] = mapped_column(String(4), nullable=False) # 'INTJ', 'ENFP', etc.
    extraversion_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    introversion_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    sensing_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    intuition_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    thinking_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    feeling_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    judging_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    perceiving_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    traits_summary_en: Mapped[Any] = mapped_column(JSONB, nullable=False)
    traits_summary_km: Mapped[Any] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment: Mapped["PersonalityAssessment"] = relationship("PersonalityAssessment", back_populates="result")


# --- RIASEC CAREER INTEREST ASSESSMENT ---

class RiasecQuestion(Base):
    __tablename__ = "riasec_questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(1), nullable=False) # 'R', 'I', 'A', 'S', 'E', 'C'
    prompt_en: Mapped[str] = mapped_column(Text, nullable=False)
    prompt_km: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class RiasecAssessment(Base):
    __tablename__ = "riasec_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="IN_PROGRESS", nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    answers: Mapped[List["RiasecAnswer"]] = relationship("RiasecAnswer", back_populates="assessment", cascade="all, delete-orphan")
    result: Mapped[Optional["RiasecResult"]] = relationship("RiasecResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class RiasecAnswer(Base):
    __tablename__ = "riasec_answers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("riasec_assessments.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("riasec_questions.id", ondelete="RESTRICT"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False) # Likert scale 1 to 5
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment: Mapped["RiasecAssessment"] = relationship("RiasecAssessment", back_populates="answers")
    question: Mapped["RiasecQuestion"] = relationship("RiasecQuestion")


class RiasecResult(Base):
    __tablename__ = "riasec_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("riasec_assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    holland_code: Mapped[str] = mapped_column(String(3), nullable=False) # e.g. 'IRE', 'SEC'
    realistic_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    investigative_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    artistic_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    social_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    enterprising_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    conventional_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    analysis_en: Mapped[Any] = mapped_column(JSONB, nullable=False)
    analysis_km: Mapped[Any] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessment: Mapped["RiasecAssessment"] = relationship("RiasecAssessment", back_populates="result")

