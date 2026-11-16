"""add telegram notification preferences and logs

Revision ID: a9e4c2b71d55
Revises: f2b7c9d41a63
Create Date: 2026-11-16 19:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "a9e4c2b71d55"
down_revision: Union[str, Sequence[str], None] = "f2b7c9d41a63"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notification_preferences",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column("telegram_chat_id", sa.String(length=50), nullable=True),
        sa.Column("telegram_username", sa.String(length=100), nullable=True),
        sa.Column("telegram_link_code", sa.String(length=64), nullable=True),
        sa.Column(
            "telegram_link_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "reminders_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
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
    )
    op.create_index(
        "ix_notification_preferences_telegram_chat_id",
        "notification_preferences",
        ["telegram_chat_id"],
        unique=True,
    )
    op.create_index(
        "ix_notification_preferences_telegram_link_code",
        "notification_preferences",
        ["telegram_link_code"],
        unique=True,
    )

    op.create_table(
        "notification_logs",
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
            sa.ForeignKey("application_plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "channel",
            sa.String(length=20),
            nullable=False,
            server_default="telegram",
        ),
        sa.Column("dedupe_key", sa.String(length=160), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "ix_notification_logs_user_id", "notification_logs", ["user_id"]
    )
    op.create_index(
        "ix_notification_logs_plan_id", "notification_logs", ["plan_id"]
    )
    op.create_index(
        "ix_notification_logs_dedupe_key",
        "notification_logs",
        ["dedupe_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_notification_logs_dedupe_key", table_name="notification_logs")
    op.drop_index("ix_notification_logs_plan_id", table_name="notification_logs")
    op.drop_index("ix_notification_logs_user_id", table_name="notification_logs")
    op.drop_table("notification_logs")
    op.drop_index(
        "ix_notification_preferences_telegram_link_code",
        table_name="notification_preferences",
    )
    op.drop_index(
        "ix_notification_preferences_telegram_chat_id",
        table_name="notification_preferences",
    )
    op.drop_table("notification_preferences")
