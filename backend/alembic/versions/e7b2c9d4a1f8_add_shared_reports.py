"""add shared reports

Revision ID: e7b2c9d4a1f8
Revises: d1a7f3b9c2e4
Create Date: 2026-11-17 18:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "e7b2c9d4a1f8"
down_revision: Union[str, Sequence[str], None] = "d1a7f3b9c2e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shared_reports",
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
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column(
            "audience",
            sa.String(length=20),
            nullable=False,
            server_default="PARENT",
        ),
        sa.Column(
            "language",
            sa.String(length=5),
            nullable=False,
            server_default="en",
        ),
        sa.Column(
            "sections",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "revoked_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "view_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "last_viewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
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
    op.create_index("ix_shared_reports_user_id", "shared_reports", ["user_id"])
    op.create_index(
        "ix_shared_reports_token", "shared_reports", ["token"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_shared_reports_token", table_name="shared_reports")
    op.drop_index("ix_shared_reports_user_id", table_name="shared_reports")
    op.drop_table("shared_reports")
