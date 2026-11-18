"""Local embeddings and pgvector-backed hybrid retrieval.

The catalogue stays in PostgreSQL as the source of truth. This module keeps a
cached `bge-m3` embedding for each verified record, then lets the advisor blend
semantic similarity with the existing keyword scorer. Everything runs locally
through Ollama; no paid embedding API is used.
"""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Sequence, Tuple

import httpx
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.ai import KnowledgeEmbedding
from app.services.ai_knowledge import KnowledgeDocument, load_knowledge_documents


class EmbeddingUnavailable(RuntimeError):
    pass


class OllamaEmbeddingClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> None:
        self.base_url = (base_url or settings.AI_OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.AI_EMBEDDING_MODEL
        self.timeout = timeout or settings.AI_EMBEDDING_TIMEOUT_SECONDS

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError):
            return False

        wanted = self.model.lower()
        for entry in payload.get("models", []):
            name = (entry.get("name") or entry.get("model") or "").lower()
            if name == wanted or name.startswith(f"{wanted}:"):
                return True
        return False

    async def embed(self, texts: Sequence[str]) -> List[List[float]]:
        if not texts:
            return []
        payload = {
            "model": self.model,
            "input": list(texts),
            "keep_alive": settings.AI_OLLAMA_KEEP_ALIVE,
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/embed", json=payload
                )
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise EmbeddingUnavailable(
                f"Embedding model {self.model} is not available: {exc}"
            ) from exc

        embeddings = data.get("embeddings")
        if not isinstance(embeddings, list) or len(embeddings) != len(texts):
            raise EmbeddingUnavailable(
                "Embedding model returned an unexpected response."
            )
        return embeddings


def embedding_text(document: KnowledgeDocument) -> str:
    """Text sent to bge-m3. Titles and snippets are repeated first because they
    carry the strongest signal; the body adds detail."""
    text = (
        f"{document.title_en}\n{document.title_km}\n"
        f"{document.snippet_en}\n{document.snippet_km}\n"
        f"{document.body_en}\n{document.body_km}"
    )
    return text[:4000]


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    """Kept for local diagnostics; production search runs inside pgvector."""
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = 0.0
    left_norm = 0.0
    right_norm = 0.0
    for a, b in zip(left, right):
        dot += a * b
        left_norm += a * a
        right_norm += b * b
    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0
    return dot / (left_norm * right_norm) ** 0.5


async def sync_embeddings(
    session: AsyncSession,
    batch_size: int = 16,
) -> Dict[str, int]:
    """Create/update embeddings for every catalogue record.

    Returns counters so the CLI can report what changed. The function embeds
    everything before writing, so a model failure leaves the old vectors intact.
    """
    client = OllamaEmbeddingClient()
    if not await client.is_available():
        raise EmbeddingUnavailable(
            f"{client.model} is not installed. Run: ollama pull {client.model}"
        )

    documents = await load_knowledge_documents(session)
    existing_rows = (
        await session.execute(select(KnowledgeEmbedding))
    ).scalars().all()
    existing = {(row.source_type, str(row.source_id)): row for row in existing_rows}

    desired_keys = {(document.type, document.id) for document in documents}
    pending: List[Tuple[KnowledgeDocument, str, str, Optional[KnowledgeEmbedding]]] = []

    for document in documents:
        text = embedding_text(document)
        digest = content_hash(text)
        row = existing.get((document.type, document.id))
        if row is None or row.content_hash != digest:
            pending.append((document, text, digest, row))

    embedded = 0

    for start in range(0, len(pending), batch_size):
        batch = pending[start : start + batch_size]
        vectors = await client.embed([item[1] for item in batch])
        for (document, text, digest, row), vector in zip(batch, vectors):
            target = row or KnowledgeEmbedding(
                source_type=document.type,
                source_id=uuid.UUID(document.id),
            )
            if row is None:
                session.add(target)
            target.source_type = document.type
            target.source_id = uuid.UUID(document.id)
            target.content_hash = digest
            target.text_content = text
            target.embedding = vector
            target.updated_at = datetime.now(timezone.utc)
            embedded += 1

    stale_keys = set(existing) - desired_keys
    deleted = 0
    if stale_keys:
        stale_ids = [existing[key].id for key in stale_keys]
        await session.execute(
            delete(KnowledgeEmbedding).where(KnowledgeEmbedding.id.in_(stale_ids))
        )
        deleted = len(stale_ids)

    await session.commit()
    return {
        "documents": len(documents),
        "embedded": embedded,
        "unchanged": len(documents) - embedded,
        "deleted": deleted,
    }


async def load_query_similarities(
    session: AsyncSession,
    query: str,
    documents: Sequence[KnowledgeDocument],
) -> Optional[Dict[Tuple[str, str], float]]:
    """Return {(type, id): cosine similarity}, or None when embeddings are off."""
    if not settings.AI_HYBRID_RETRIEVAL:
        return None

    client = OllamaEmbeddingClient()
    try:
        vectors = await client.embed([query])
    except EmbeddingUnavailable:
        return None
    if not vectors:
        return None

    query_vector = vectors[0]
    distance = KnowledgeEmbedding.embedding.cosine_distance(query_vector)
    rows = (
        await session.execute(
            select(
                KnowledgeEmbedding.source_type,
                KnowledgeEmbedding.source_id,
                distance.label("distance"),
            )
            .order_by(distance)
            .limit(40)
        )
    ).all()
    if not rows:
        return None

    known_ids = {document.id for document in documents}
    similarities: Dict[Tuple[str, str], float] = {}
    for source_type, source_id, vector_distance in rows:
        source_id_text = str(source_id)
        if source_id_text not in known_ids:
            continue
        similarity = 1.0 - float(vector_distance)
        if similarity >= settings.AI_VECTOR_MIN_SIMILARITY:
            similarities[(source_type, source_id_text)] = similarity
    return similarities
