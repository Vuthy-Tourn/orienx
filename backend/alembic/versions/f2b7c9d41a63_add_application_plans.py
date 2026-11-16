"""add application plans

Revision ID: f2b7c9d41a63
Revises: 6b2f4c1d9a70
Create Date: 2026-11-16 18:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "f2b7c9d41a63"
down_revision: Union[str, Sequence[str], None] = "6b2f4c1d9a70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "application_plans",
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
        sa.Column("kind", sa.String(length=20), nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="RESEARCHING",
        ),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column(
            "reminder_days",
            sa.Integer(),
            nullable=False,
            server_default="7",
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("next_action", sa.String(length=255), nullable=True),
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
        sa.UniqueConstraint(
            "user_id",
            "kind",
            "target_id",
            name="uq_application_plan_target",
        ),
    )
    op.create_index(
        "ix_application_plans_user_id", "application_plans", ["user_id"]
    )
    op.create_index(
        "ix_application_plans_kind", "application_plans", ["kind"]
    )
    op.create_index(
        "ix_application_plans_target_id", "application_plans", ["target_id"]
    )
    op.create_index(
        "ix_application_plans_status", "application_plans", ["status"]
    )
    op.create_index(
        "ix_application_plans_deadline", "application_plans", ["deadline"]
    )


def downgrade() -> None:
    op.drop_index("ix_application_plans_deadline", table_name="application_plans")
    op.drop_index("ix_application_plans_status", table_name="application_plans")
    op.drop_index("ix_application_plans_target_id", table_name="application_plans")
    op.drop_index("ix_application_plans_kind", table_name="application_plans")
    op.drop_index("ix_application_plans_user_id", table_name="application_plans")
    op.drop_table("application_plans")
