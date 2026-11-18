"""add knowledge embeddings for hybrid retrieval

Revision ID: d7e3f9a2c5b8
Revises: c4d9e1a6b2f7
Create Date: 2026-11-18 10:40:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql


revision: str = "d7e3f9a2c5b8"
down_revision: Union[str, Sequence[str], None] = "c4d9e1a6b2f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "knowledge_embeddings",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column("source_type", sa.String(length=30), nullable=False),
        sa.Column(
            "source_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("text_content", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(1024), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint(
            "source_type",
            "source_id",
            name="uq_knowledge_embedding_source",
        ),
    )
    op.create_index(
        "ix_knowledge_embeddings_source_type",
        "knowledge_embeddings",
        ["source_type"],
    )
    op.create_index(
        "ix_knowledge_embeddings_source_id",
        "knowledge_embeddings",
        ["source_id"],
    )
    # HNSW keeps nearest-neighbour queries fast as the catalogue grows.
    op.execute(
        "CREATE INDEX ix_knowledge_embeddings_embedding_hnsw "
        "ON knowledge_embeddings USING hnsw (embedding vector_cosine_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_knowledge_embeddings_embedding_hnsw")
    op.drop_index(
        "ix_knowledge_embeddings_source_id",
        table_name="knowledge_embeddings",
    )
    op.drop_index(
        "ix_knowledge_embeddings_source_type",
        table_name="knowledge_embeddings",
    )
    op.drop_table("knowledge_embeddings")
