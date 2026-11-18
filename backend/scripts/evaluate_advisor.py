"""Run the 100-question advisor evaluation set.

Default mode is retrieval-only and hybrid (fast, free). Use --with-model to also
measure generated answers; that runs the local model once per question and is
much slower.

Usage:
    cd backend
    python scripts/evaluate_advisor.py
    python scripts/evaluate_advisor.py --mode lexical
    python scripts/evaluate_advisor.py --with-model --limit 10
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.services.ai_advisor_service import AIAdvisorService  # noqa: E402

DEFAULT_DATASET = Path(__file__).resolve().parents[1] / "data" / "eval" / "advisor_eval.jsonl"
REPORT_DIR = Path(__file__).resolve().parents[1] / "data" / "eval" / "reports"

REFUSAL_MARKERS = (
    "could not find",
    "couldn't find",
    "do not have",
    "don't have",
    "not available",
    "no verified",
    "មិនបានរកឃើញ",
    "មិនមានព័ត៌មាន",
)


def load_dataset(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def percent(value: float) -> str:
    return f"{value * 100:.1f}%"


async def evaluate(
    dataset: List[Dict[str, Any]],
    mode: str,
    with_model: bool,
    limit: int,
) -> Dict[str, Any]:
    rows = dataset[:limit] if limit > 0 else dataset
    results = []

    async with AsyncSessionLocal() as session:
        for index, row in enumerate(rows, start=1):
            started = time.perf_counter()
            try:
                draft = await AIAdvisorService.generate_answer(
                    session,
                    row["question"],
                    row.get("language", "en"),
                    use_model=with_model,
                    hybrid=mode == "hybrid",
                )
                sources = [source.url for source in draft.sources]
                answer = draft.answer
                tools_used = list(draft.tools_used)
                error = None
            except Exception as exc:  # keep the evaluation running
                sources = []
                answer = ""
                tools_used = []
                error = f"{type(exc).__name__}: {exc}"
                draft = None

            latency_ms = int((time.perf_counter() - started) * 1000)
            expected_urls = list(row.get("expected_urls") or [])
            expected_tools = list(row.get("expected_tools") or [])
            must_include = list(row.get("must_include") or [])
            source_matches = [url for url in expected_urls if url in sources]
            recall = (
                len(source_matches) / len(expected_urls) if expected_urls else 0.0
            )
            source_hit = bool(source_matches) if expected_urls else not sources
            missing_facts = [
                fact for fact in must_include if fact.casefold() not in answer.casefold()
            ]
            tool_hit = (
                set(expected_tools).issubset(set(tools_used))
                if expected_tools
                else True
            )

            if row.get("must_refuse"):
                refusal = not sources or any(
                    marker in answer.casefold() for marker in REFUSAL_MARKERS
                )
                passed = refusal and not tools_used
            else:
                refusal = False
                passed = source_hit and not missing_facts and tool_hit

            results.append(
                {
                    "id": row["id"],
                    "category": row.get("category"),
                    "question": row["question"],
                    "language": row.get("language", "en"),
                    "expected_urls": expected_urls,
                    "sources": sources,
                    "missing_facts": missing_facts,
                    "must_refuse": bool(row.get("must_refuse")),
                    "refusal": refusal,
                    "expected_tools": expected_tools,
                    "tools_used": tools_used,
                    "tool_hit": tool_hit,
                    "source_hit": source_hit,
                    "recall": recall,
                    "passed": passed,
                    "answer": answer,
                    "mode": draft.mode if draft else "error",
                    "tool_names": draft.tools_used if draft else [],
                    "latency_ms": latency_ms,
                    "error": error,
                }
            )
            print(
                f"[{index:03d}/{len(rows):03d}] {row['id']} "
                f"{'PASS' if passed else 'FAIL'} — {row['question'][:70]}",
                flush=True,
            )

    non_refusal = [item for item in results if not item["must_refuse"]]
    refusals = [item for item in results if item["must_refuse"]]
    fact_checks = [item for item in non_refusal if item["missing_facts"] or item["expected_urls"]]
    tool_checks = [item for item in non_refusal if item["expected_tools"]]

    summary = {
        "total": len(results),
        "mode": mode,
        "with_model": with_model,
        "source_hit_rate": (
            sum(1 for item in non_refusal if item["source_hit"]) / len(non_refusal)
            if non_refusal
            else 0.0
        ),
        "source_recall": (
            sum(item["recall"] for item in non_refusal) / len(non_refusal)
            if non_refusal
            else 0.0
        ),
        "must_include_rate": (
            sum(1 for item in non_refusal if not item["missing_facts"]) / len(non_refusal)
            if non_refusal
            else 0.0
        ),
        "tool_routing_rate": (
            sum(1 for item in tool_checks if item["tool_hit"]) / len(tool_checks)
            if tool_checks
            else 1.0
        ),
        "refusal_accuracy": (
            sum(1 for item in refusals if item["refusal"]) / len(refusals)
            if refusals
            else 1.0
        ),
        "avg_latency_ms": sum(item["latency_ms"] for item in results) / len(results)
        if results
        else 0.0,
        "failures": [item["id"] for item in results if not item["passed"]],
    }
    return {"summary": summary, "results": results}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--mode", choices=("hybrid", "lexical"), default="hybrid")
    parser.add_argument(
        "--with-model",
        action="store_true",
        help="Generate answers with the local model (slow; use --limit for a sample).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Evaluate only the first N questions (0 = all 100).",
    )
    parser.add_argument("--show-failures", type=int, default=10)
    parser.add_argument("--fail-under-source-hit", type=float, default=0.75)
    parser.add_argument("--fail-under-refusal", type=float, default=0.85)
    args = parser.parse_args()

    dataset = load_dataset(args.dataset)
    report = asyncio.run(
        evaluate(dataset, args.mode, args.with_model, args.limit)
    )
    summary = report["summary"]

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    label = "model" if args.with_model else "retrieval"
    report_path = REPORT_DIR / f"advisor_eval_{label}_{args.mode}_{stamp}.json"
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print("\n=== Advisor evaluation ===")
    print(f"Questions:        {summary['total']}")
    print(f"Mode:             {summary['mode']} / {'local model' if args.with_model else 'retrieval only'}")
    print(f"Source hit:       {percent(summary['source_hit_rate'])}")
    print(f"Source recall:    {percent(summary['source_recall'])}")
    print(f"Must-include:     {percent(summary['must_include_rate'])}")
    print(f"Tool routing:     {percent(summary['tool_routing_rate'])}")
    print(f"Refusal accuracy: {percent(summary['refusal_accuracy'])}")
    print(f"Avg latency:      {summary['avg_latency_ms']:.0f} ms")
    print(f"Failures:         {len(summary['failures'])}")
    print(f"Report:           {report_path}")

    failures = [item for item in report["results"] if not item["passed"]]
    if failures and args.show_failures:
        print("\nFirst failures:")
        for item in failures[: args.show_failures]:
            reason = []
            if item["error"]:
                reason.append(item["error"])
            if item["must_refuse"] and not item["refusal"]:
                reason.append("did not refuse")
            if not item["source_hit"]:
                reason.append(f"missing source {item['expected_urls']}")
            if item["missing_facts"]:
                reason.append(f"missing facts {item['missing_facts']}")
            if not item["tool_hit"]:
                reason.append(f"expected tools {item['expected_tools']} got {item['tools_used']}")
            print(f"  {item['id']}: {item['question'][:70]} — {'; '.join(reason)}")

    if summary["source_hit_rate"] < args.fail_under_source_hit:
        print(f"\nFAILED: source hit below {percent(args.fail_under_source_hit)}")
        return 1
    if summary["refusal_accuracy"] < args.fail_under_refusal:
        print(f"\nFAILED: refusal accuracy below {percent(args.fail_under_refusal)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
