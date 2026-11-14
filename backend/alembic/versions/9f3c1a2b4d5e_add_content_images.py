"""add image fields to majors and scholarships

Revision ID: 9f3c1a2b4d5e
Revises: 8d9fa968be53
Create Date: 2026-11-14 10:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f3c1a2b4d5e"
down_revision: Union[str, Sequence[str], None] = "8d9fa968be53"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("majors", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.add_column(
        "scholarships", sa.Column("poster_url", sa.String(length=500), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("scholarships", "poster_url")
    op.drop_column("majors", "image_url")
