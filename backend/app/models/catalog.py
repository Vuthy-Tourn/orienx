import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlalchemy import String, Boolean, Integer, Numeric, DateTime, ForeignKey, Table, Column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class MajorCareer(Base):
    __tablename__ = "major_careers"
    
    major_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("majors.id", ondelete="CASCADE"), primary_key=True)
    career_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("careers.id", ondelete="CASCADE"), primary_key=True)


class University(Base):
    __tablename__ = "universities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    name: Mapped[Any] = mapped_column(JSONB, nullable=False) # { "en": "...", "km": "..." }
    acronym: Mapped[Any] = mapped_column(JSONB, nullable=False) # { "en": "RUPP", "km": "..." }
    description: Mapped[Any] = mapped_column(JSONB, nullable=False)
    university_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True) # PUBLIC, PRIVATE
    logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(500))
    province: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    address: Mapped[Any] = mapped_column(JSONB, nullable=False)
    website_url: Mapped[str] = mapped_column(String(500), nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255))
    contact_phone: Mapped[Optional[str]] = mapped_column(String(100))
    established_year: Mapped[Optional[int]] = mapped_column(Integer)
    tuition_range_min_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    tuition_range_max_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    is_tuition_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    admission_requirements: Mapped[Optional[Any]] = mapped_column(JSONB)
    facilities: Mapped[Optional[Any]] = mapped_column(JSONB)
    scholarship_summary: Mapped[Optional[Any]] = mapped_column(JSONB)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    faculties: Mapped[List["Faculty"]] = relationship("Faculty", back_populates="university", cascade="all, delete-orphan")
    university_majors: Mapped[List["UniversityMajor"]] = relationship("UniversityMajor", back_populates="university", cascade="all, delete-orphan")


class Faculty(Base):
    __tablename__ = "faculties"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    university_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    name: Mapped[Any] = mapped_column(JSONB, nullable=False)
    description: Mapped[Optional[Any]] = mapped_column(JSONB)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    university: Mapped["University"] = relationship("University", back_populates="faculties")
    university_majors: Mapped[List["UniversityMajor"]] = relationship("UniversityMajor", back_populates="faculty")


class Major(Base):
    __tablename__ = "majors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    name: Mapped[Any] = mapped_column(JSONB, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    description: Mapped[Any] = mapped_column(JSONB, nullable=False)
    subjects_studied: Mapped[Any] = mapped_column(JSONB, nullable=False)
    required_skills: Mapped[Any] = mapped_column(JSONB, nullable=False)
    potential_challenges: Mapped[Any] = mapped_column(JSONB, nullable=False)
    riasec_primary: Mapped[str] = mapped_column(String(1), nullable=False, index=True) # R, I, A, S, E, C
    riasec_secondary: Mapped[str] = mapped_column(String(1), nullable=False, index=True)
    personality_affinity: Mapped[Optional[str]] = mapped_column(String(30)) # e.g. "INTJ,INTP"
    is_stem: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    university_majors: Mapped[List["UniversityMajor"]] = relationship("UniversityMajor", back_populates="major", cascade="all, delete-orphan", lazy="selectin")
    careers: Mapped[List["Career"]] = relationship("Career", secondary="major_careers", back_populates="majors", lazy="selectin")


class UniversityMajor(Base):
    __tablename__ = "university_majors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    university_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    faculty_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("faculties.id", ondelete="SET NULL"))
    major_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("majors.id", ondelete="CASCADE"), nullable=False, index=True)
    degree_level: Mapped[str] = mapped_column(String(30), default="BACHELOR", nullable=False) # ASSOCIATE, BACHELOR, MASTER, DOCTORATE
    duration_years: Mapped[float] = mapped_column(Numeric(3, 1), default=4.0, nullable=False)
    tuition_annual_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    is_tuition_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    language_of_instruction: Mapped[str] = mapped_column(String(30), default="BILINGUAL")
    admission_criteria: Mapped[Optional[Any]] = mapped_column(JSONB)
    official_curriculum_url: Mapped[Optional[str]] = mapped_column(String(500))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    university: Mapped["University"] = relationship("University", back_populates="university_majors")
    faculty: Mapped[Optional["Faculty"]] = relationship("Faculty", back_populates="university_majors")
    major: Mapped["Major"] = relationship("Major", back_populates="university_majors")


class Career(Base):
    __tablename__ = "careers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    title: Mapped[Any] = mapped_column(JSONB, nullable=False)
    industry: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    description: Mapped[Any] = mapped_column(JSONB, nullable=False)
    responsibilities: Mapped[Any] = mapped_column(JSONB, nullable=False)
    required_skills: Mapped[Any] = mapped_column(JSONB, nullable=False)
    education_level: Mapped[str] = mapped_column(String(50), nullable=False)
    work_environments: Mapped[Any] = mapped_column(JSONB, nullable=False)
    career_progression: Mapped[Any] = mapped_column(JSONB, nullable=False)
    riasec_code: Mapped[str] = mapped_column(String(3), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    majors: Mapped[List["Major"]] = relationship("Major", secondary="major_careers", back_populates="careers", lazy="selectin")
