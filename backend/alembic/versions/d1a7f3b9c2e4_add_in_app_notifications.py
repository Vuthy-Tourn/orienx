"""add in-app notifications

Revision ID: d1a7f3b9c2e4
Revises: c8f2a1d4e6b7
Create Date: 2026-11-17 16:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "d1a7f3b9c2e4"
down_revision: Union[str, Sequence[str], None] = "c8f2a1d4e6b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "in_app_notifications",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "plan_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("application_plans.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "category",
            sa.String(length=30),
            nullable=False,
            server_default="SYSTEM",
        ),
        sa.Column("title_en", sa.String(length=180), nullable=False),
        sa.Column("title_km", sa.String(length=180), nullable=True),
        sa.Column("message_en", sa.Text(), nullable=False),
        sa.Column("message_km", sa.Text(), nullable=True),
        sa.Column("href", sa.String(length=500), nullable=True),
        sa.Column("dedupe_key", sa.String(length=200), nullable=True),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "read_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint(
            "user_id",
            "dedupe_key",
            name="uq_in_app_notification_dedupe",
        ),
    )
    op.create_index(
        "ix_in_app_notifications_user_id",
        "in_app_notifications",
        ["user_id"],
    )
    op.create_index(
        "ix_in_app_notifications_plan_id",
        "in_app_notifications",
        ["plan_id"],
    )
    op.create_index(
        "ix_in_app_notifications_category",
        "in_app_notifications",
        ["category"],
    )
    op.create_index(
        "ix_in_app_notifications_is_read",
        "in_app_notifications",
        ["is_read"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_in_app_notifications_is_read",
        table_name="in_app_notifications",
    )
    op.drop_index(
        "ix_in_app_notifications_category",
        table_name="in_app_notifications",
    )
    op.drop_index(
        "ix_in_app_notifications_plan_id",
        table_name="in_app_notifications",
    )
    op.drop_index(
        "ix_in_app_notifications_user_id",
        table_name="in_app_notifications",
    )
    op.drop_table("in_app_notifications")
