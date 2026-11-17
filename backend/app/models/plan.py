import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ApplicationPlan(Base):
    __tablename__ = "application_plans"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "kind",
            "target_id",
            name="uq_application_plan_target",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    kind: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )  # UNIVERSITY, SCHOLARSHIP
    target_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(30), default="RESEARCHING", nullable=False, index=True
    )
    deadline: Mapped[Optional[date]] = mapped_column(Date, index=True)
    reminder_days: Mapped[int] = mapped_column(
        Integer, default=7, nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    next_action: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    documents: Mapped[List["ApplicationPlanDocument"]] = relationship(
        "ApplicationPlanDocument",
        back_populates="plan",
        cascade="all, delete-orphan",
        order_by="ApplicationPlanDocument.sort_order",
    )


class ApplicationPlanDocument(Base):
    __tablename__ = "application_plan_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("application_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_type: Mapped[str] = mapped_column(
        String(40), default="OTHER", nullable=False
    )
    name_en: Mapped[str] = mapped_column(String(120), nullable=False)
    name_km: Mapped[Optional[str]] = mapped_column(String(120))
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date, index=True)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    plan: Mapped["ApplicationPlan"] = relationship(
        "ApplicationPlan", back_populates="documents"
    )
