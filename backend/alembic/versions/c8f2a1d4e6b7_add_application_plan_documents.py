"""add application plan document checklist

Revision ID: c8f2a1d4e6b7
Revises: b7d1e5c93f20
Create Date: 2026-11-17 14:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c8f2a1d4e6b7"
down_revision: Union[str, Sequence[str], None] = "b7d1e5c93f20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "application_plan_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "document_type",
            sa.String(length=40),
            nullable=False,
            server_default=sa.text("'OTHER'"),
        ),
        sa.Column("name_en", sa.String(length=120), nullable=False),
        sa.Column("name_km", sa.String(length=120), nullable=True),
        sa.Column(
            "is_required",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "is_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "completed_at", sa.DateTime(timezone=True), nullable=True
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "sort_order",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["plan_id"],
            ["application_plans.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_application_plan_documents_plan_id",
        "application_plan_documents",
        ["plan_id"],
        unique=False,
    )
    op.create_index(
        "ix_application_plan_documents_is_completed",
        "application_plan_documents",
        ["is_completed"],
        unique=False,
    )
    op.create_index(
        "ix_application_plan_documents_due_date",
        "application_plan_documents",
        ["due_date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_application_plan_documents_due_date",
        table_name="application_plan_documents",
    )
    op.drop_index(
        "ix_application_plan_documents_is_completed",
        table_name="application_plan_documents",
    )
    op.drop_index(
        "ix_application_plan_documents_plan_id",
        table_name="application_plan_documents",
    )
    op.drop_table("application_plan_documents")
