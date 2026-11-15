"""add university data provenance fields

Revision ID: 6b2f4c1d9a70
Revises: 9f3c1a2b4d5e
Create Date: 2026-11-15 11:15:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6b2f4c1d9a70"
down_revision: Union[str, Sequence[str], None] = "9f3c1a2b4d5e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "universities",
        sa.Column("data_source", sa.String(length=200), nullable=True),
    )
    op.add_column(
        "universities",
        sa.Column("source_url", sa.String(length=500), nullable=True),
    )
    op.add_column(
        "universities",
        sa.Column("last_verified_at", sa.Date(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("universities", "last_verified_at")
    op.drop_column("universities", "source_url")
    op.drop_column("universities", "data_source")
