"""Export AI advisor interactions as a JSONL fine-tuning dataset.

This is the free half of "train your own model": every advisor answer is logged
in `ai_interactions`, and this script turns the useful rows into the standard
chat format accepted by Unsloth, TRL, Axolotl, and most fine-tuning tools.

Usage:
    cd backend
    python scripts/export_ai_training_data.py
    python scripts/export_ai_training_data.py --output data/advisory.jsonl --include-unrated
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

from sqlalchemy import or_, select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.ai import AIInteraction  # noqa: E402


def build_record(interaction: AIInteraction) -> dict:
    language_name = "Khmer" if interaction.language == "km" else "English"
    return {
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are Futera's education and career advisor for students "
                    "in Cambodia. Answer in "
                    f"{language_name}. Use only verified Futera records and never "
                    "invent tuition, deadlines, scholarship eligibility, or "
                    "admission requirements."
                ),
            },
            {"role": "user", "content": interaction.question},
            {"role": "assistant", "content": interaction.answer},
        ],
        "metadata": {
            "interaction_id": str(interaction.id),
            "language": interaction.language,
            "mode": interaction.mode,
            "model_name": interaction.model_name,
            "is_helpful": interaction.is_helpful,
            "created_at": interaction.created_at.isoformat(),
            "sources": interaction.sources or [],
        },
    }


async def export(output: Path, include_unrated: bool, limit: int | None) -> int:
    query = select(AIInteraction).order_by(AIInteraction.created_at.asc())
    if not include_unrated:
        query = query.where(
            or_(AIInteraction.is_helpful.is_(True), AIInteraction.is_helpful.is_(None))
        )
    query = query.where(AIInteraction.is_helpful.is_not(False))
    if limit:
        query = query.limit(limit)

    output.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    async with AsyncSessionLocal() as session:
        result = await session.execute(query)
        with output.open("w", encoding="utf-8") as handle:
            for interaction in result.scalars():
                handle.write(
                    json.dumps(build_record(interaction), ensure_ascii=False) + "\n"
                )
                count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/ai_training_data.jsonl"),
        help="Destination JSONL path (default: data/ai_training_data.jsonl)",
    )
    parser.add_argument(
        "--include-unrated",
        action="store_true",
        help="Include rows with no thumbs-up/down (thumbs-down rows are always excluded).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Export at most this many rows.",
    )
    args = parser.parse_args()

    count = asyncio.run(export(args.output, args.include_unrated, args.limit))
    print(f"Exported {count} interactions to {args.output}")


if __name__ == "__main__":
    main()
