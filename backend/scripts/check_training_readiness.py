"""Check whether there is enough logged data for a useful fine-tune.

Fine-tuning is intentionally gated: a few dozen interactions only teach the
model to memorize those answers. The target is at least 500 good examples
(thumbs-up or unrated; thumbs-down rows are always excluded).

Usage:
    cd backend
    python scripts/check_training_readiness.py
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from sqlalchemy import func, select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.models.ai import AIInteraction  # noqa: E402


async def counts() -> dict:
    async with AsyncSessionLocal() as session:
        total = await session.scalar(
            select(func.count()).select_from(AIInteraction)
        ) or 0
        helpful = await session.scalar(
            select(func.count())
            .select_from(AIInteraction)
            .where(AIInteraction.is_helpful.is_(True))
        ) or 0
        unhelpful = await session.scalar(
            select(func.count())
            .select_from(AIInteraction)
            .where(AIInteraction.is_helpful.is_(False))
        ) or 0
        unrated = await session.scalar(
            select(func.count())
            .select_from(AIInteraction)
            .where(AIInteraction.is_helpful.is_(None))
        ) or 0

        by_language = dict(
            (
                await session.execute(
                    select(AIInteraction.language, func.count())
                    .group_by(AIInteraction.language)
                )
            ).all()
        )
        by_mode = dict(
            (
                await session.execute(
                    select(AIInteraction.mode, func.count())
                    .group_by(AIInteraction.mode)
                )
            ).all()
        )

    good = helpful + unrated
    rated = helpful + unhelpful
    return {
        "total": total,
        "helpful": helpful,
        "unhelpful": unhelpful,
        "unrated": unrated,
        "good": good,
        "rated": rated,
        "helpful_ratio": (helpful / rated) if rated else 0.0,
        "by_language": by_language,
        "by_mode": by_mode,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--minimum", type=int, default=500)
    parser.add_argument("--min-helpful-ratio", type=float, default=0.80)
    args = parser.parse_args()

    stats = asyncio.run(counts())
    print("AI interaction dataset")
    print(f"  total:          {stats['total']}")
    print(f"  helpful:        {stats['helpful']}")
    print(f"  unrated:        {stats['unrated']}")
    print(f"  thumbs-down:    {stats['unhelpful']} (excluded from training)")
    print(f"  usable:         {stats['good']}")
    print(f"  helpful ratio:  {stats['helpful_ratio'] * 100:.1f}% of rated")
    print(f"  languages:      {stats['by_language']}")
    print(f"  modes:          {stats['by_mode']}")

    remaining = max(0, args.minimum - stats["good"])
    quality_ok = (
        stats["rated"] == 0
        or stats["helpful_ratio"] >= args.min_helpful_ratio
    )

    print()
    if remaining == 0 and quality_ok:
        print(f"READY: {stats['good']} usable examples (target {args.minimum}).")
        print("Next:")
        print("  python scripts/export_ai_training_data.py --output data/ai_training_data.jsonl")
        print("  See backend/training/README.md for the LoRA recipe.")
        return 0

    if not quality_ok:
        print(
            f"NOT READY: only {stats['helpful_ratio'] * 100:.1f}% of rated "
            f"answers are helpful (target {args.min_helpful_ratio * 100:.0f}%)."
        )
        print("Review thumbs-down answers before training.")
    if remaining > 0:
        print(
            f"NOT READY: need {remaining} more usable examples "
            f"(target {args.minimum})."
        )
        print("Keep the advisor live and ask students to use the feedback buttons.")
    print("Training now would only memorize a tiny sample; improve retrieval first.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
