"""add admission requirements and bacii grade

Revision ID: b7d1e5c93f20
Revises: a9e4c2b71d55
Create Date: 2026-11-16 21:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "b7d1e5c93f20"
down_revision: Union[str, Sequence[str], None] = "a9e4c2b71d55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "university_majors",
        sa.Column("min_bacii_grade", sa.String(length=1), nullable=True),
    )
    op.add_column(
        "university_majors",
        sa.Column("required_subjects", postgresql.JSONB(), nullable=True),
    )
    op.add_column(
        "university_majors",
        sa.Column(
            "is_admission_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "university_majors",
        sa.Column("admission_source_url", sa.String(length=500), nullable=True),
    )
    op.add_column(
        "student_profiles",
        sa.Column("bacii_grade", sa.String(length=1), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("student_profiles", "bacii_grade")
    op.drop_column("university_majors", "admission_source_url")
    op.drop_column("university_majors", "is_admission_verified")
    op.drop_column("university_majors", "required_subjects")
    op.drop_column("university_majors", "min_bacii_grade")
