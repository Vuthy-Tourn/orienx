"""Generate or refresh local embeddings for every verified catalogue record.

Usage:
    cd backend
    python scripts/sync_knowledge_embeddings.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.services.knowledge_embeddings import (  # noqa: E402
    EmbeddingUnavailable,
    sync_embeddings,
)


async def main() -> int:
    try:
        async with AsyncSessionLocal() as session:
            stats = await sync_embeddings(session)
    except EmbeddingUnavailable as exc:
        print(f"Embedding unavailable: {exc}")
        return 1

    print(
        "Embeddings synced: "
        f"{stats['documents']} documents, "
        f"{stats['embedded']} embedded, "
        f"{stats['unchanged']} unchanged, "
        f"{stats['deleted']} deleted."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
