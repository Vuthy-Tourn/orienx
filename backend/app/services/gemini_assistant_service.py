"""Gemini-powered assistant used by the floating mascot widget.

The assistant reuses Futera's grounded retrieval + tools, then lets Gemini
phrase the answer. If the key is missing or the API fails, it falls back to the
deterministic verified-data answer instead of breaking the widget.
"""

from __future__ import annotations

import logging
import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai import AIInteraction
from app.models.auth import User
from app.schemas.ai import AdvisorAnswerOut
from app.services.ai_advisor_service import AIAdvisorService
from app.services.ai_knowledge import suggested_questions
from app.services.gemini_client import GeminiClient, GeminiUnavailable

logger = logging.getLogger(__name__)


class GeminiAssistantService:
    @staticmethod
    async def ask(
        session: AsyncSession,
        user: User,
        question: str,
        language: str,
    ) -> AdvisorAnswerOut:
        started = time.perf_counter()
        prepared = await AIAdvisorService.prepare(
            session,
            question,
            language,
            use_model=False,
            build_prompt=True,
        )

        client = GeminiClient()
        answer = ""
        mode = "retrieval_only"
        warning = None

        try:
            if not prepared.system_prompt:
                raise GeminiUnavailable("No grounded prompt could be built.")
            answer = await client.generate(
                prepared.system_prompt, question.strip()
            )
            if answer:
                mode = "gemini"
        except GeminiUnavailable as exc:
            logger.warning("Gemini unavailable: %s", exc)
            warning = (
                "Gemini is not configured; answered from verified records."
                if not client.configured
                else "Gemini is unavailable; answered from verified records."
            )
            answer = prepared.fallback_answer
        except Exception:
            logger.exception("Unexpected Gemini assistant failure")
            warning = "Gemini is unavailable; answered from verified records."
            answer = prepared.fallback_answer

        if not answer:
            answer = prepared.fallback_answer
            mode = "retrieval_only"

        latency_ms = int((time.perf_counter() - started) * 1000)
        interaction = AIInteraction(
            user_id=user.id,
            question=question.strip(),
            answer=answer,
            language=language,
            mode=mode,
            model_name=client.last_model if mode == "gemini" else None,
            sources=[source.model_dump() for source in prepared.sources],
            latency_ms=latency_ms,
        )
        session.add(interaction)
        await session.commit()
        await session.refresh(interaction)

        return AdvisorAnswerOut(
            interaction_id=interaction.id,
            answer=answer,
            mode=mode,
            model_name=client.last_model if mode == "gemini" else None,
            sources=prepared.sources,
            suggested_questions=suggested_questions(language),
            latency_ms=latency_ms,
            tools_used=prepared.tools_used,
            warning=warning,
        )
