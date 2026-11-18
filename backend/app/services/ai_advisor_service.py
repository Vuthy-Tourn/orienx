from __future__ import annotations

import time
import uuid
from dataclasses import dataclass
from datetime import date
from typing import AsyncGenerator, Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.ai import AIInteraction
from app.models.auth import User
from app.schemas.ai import AdvisorAnswerOut, AdvisorSourceOut, AdvisorStatusOut
from app.services.ai_knowledge import (
    build_context,
    build_extractive_answer,
    load_knowledge_documents,
    retrieve_documents,
    suggested_questions,
)
from app.services.advisor_tools import ToolRun, run_relevant_tools
from app.services.knowledge_embeddings import load_query_similarities
from app.services.local_model import LocalModelClient

SYSTEM_PROMPT = """You are Futera's education and career advisor for students in Cambodia.
Today is {today}.

Rules:
- Answer ONLY with facts found in the TOOL RESULTS or CONTEXT below.
- TOOL RESULTS are computed directly from Futera's database and are authoritative. If they contain a list, include every listed item; never add, remove, or replace universities/programs with ones not in the list.
- If the context does not contain the answer, say you do not have that verified detail and point to the closest source. Never invent tuition, deadlines, scholarship eligibility, or admission requirements.
- Reply in {language}. Keep the answer concise, around 70 words. Use up to 5 bullet points when listing TOOL RESULTS.
- Do not repeat the context verbatim; summarize the useful facts.
- If you cannot write the requested language fluently, answer in English and say so.
- Be warm, practical, and specific to Cambodia. Do not mention the word CONTEXT.

TOOL RESULTS:
{tool_results}

RETRIEVED RECORDS:
{context}
"""


@dataclass(slots=True)
class AdvisorDraft:
    answer: str
    mode: str
    model_name: Optional[str]
    sources: List[AdvisorSourceOut]
    latency_ms: int
    tools_used: List[str]


@dataclass(slots=True)
class PreparedAnswer:
    client: LocalModelClient
    model_name: Optional[str]
    system_prompt: Optional[str]
    sources: List[AdvisorSourceOut]
    tools_used: List[str]
    fallback_answer: str


class AIAdvisorService:
    @staticmethod
    async def get_status() -> AdvisorStatusOut:
        client = LocalModelClient()
        connected, model_name = (
            await client.detect_model() if settings.AI_ADVISOR_ENABLED else (False, None)
        )
        return AdvisorStatusOut(
            enabled=settings.AI_ADVISOR_ENABLED,
            model_connected=connected,
            model_name=model_name,
            mode="local_model" if connected else "retrieval_only",
            setup_command="ollama pull gemma3:12b",
        )

    @staticmethod
    async def prepare(
        session: AsyncSession,
        question: str,
        language: str,
        use_model: bool = True,
        hybrid: bool = True,
        build_prompt: bool = False,
    ) -> PreparedAnswer:
        question = question.strip()
        documents = await load_knowledge_documents(session)
        similarities = (
            await load_query_similarities(session, question, documents)
            if hybrid
            else None
        )
        relevant = retrieve_documents(
            documents,
            question,
            limit=settings.AI_MAX_CONTEXT_DOCS,
            similarities=similarities,
        )

        tool_run = ToolRun()
        if settings.AI_TOOLS_ENABLED:
            tool_run = await run_relevant_tools(
                session, question, documents, language
            )
            if tool_run.related:
                by_key = {
                    (document.type, document.slug): document
                    for document in documents
                }
                merged = []
                seen_ids = set()
                for source_type, slug in tool_run.related:
                    document = by_key.get((source_type, slug))
                    if document is not None and document.id not in seen_ids:
                        merged.append(document)
                        seen_ids.add(document.id)
                for document in relevant:
                    if document.id not in seen_ids:
                        merged.append(document)
                        seen_ids.add(document.id)
                relevant = merged[:8]

        client = LocalModelClient()
        connected, model_name = (
            await client.detect_model()
            if use_model and settings.AI_ADVISOR_ENABLED
            else (False, None)
        )

        system_prompt: Optional[str] = None
        if (connected and model_name) or build_prompt:
            context = build_context(
                relevant[: 2 if tool_run.names else settings.AI_MAX_CONTEXT_DOCS],
                language,
                settings.AI_MAX_CONTEXT_CHARS,
            )
            language_name = "Khmer (ភាសាខ្មែរ)" if language == "km" else "English"
            system_prompt = SYSTEM_PROMPT.format(
                today=date.today().isoformat(),
                language=language_name,
                tool_results=tool_run.context or "No tool results.",
                context=context or "No matching records were found.",
            )

        sources = [
            AdvisorSourceOut(
                type=document.type,
                id=document.id,
                title_en=document.title_en,
                title_km=document.title_km,
                url=document.url,
                snippet_en=document.snippet_en,
                snippet_km=document.snippet_km,
            )
            for document in relevant
        ]
        fallback_answer = tool_run.answer or build_extractive_answer(
            relevant, language
        )

        return PreparedAnswer(
            client=client,
            model_name=model_name if connected else None,
            system_prompt=system_prompt,
            sources=sources,
            tools_used=tool_run.names,
            fallback_answer=fallback_answer,
        )

    @staticmethod
    async def generate_answer(
        session: AsyncSession,
        question: str,
        language: str,
        use_model: bool = True,
        hybrid: bool = True,
    ) -> AdvisorDraft:
        started = time.perf_counter()
        prepared = await AIAdvisorService.prepare(
            session, question, language, use_model, hybrid
        )

        answer: Optional[str] = None
        mode = "retrieval_only"
        if prepared.model_name and prepared.system_prompt:
            answer = await prepared.client.chat(
                prepared.model_name, prepared.system_prompt, question.strip()
            )
            if answer:
                mode = "local_model"

        if not answer:
            answer = prepared.fallback_answer

        return AdvisorDraft(
            answer=answer,
            mode=mode,
            model_name=prepared.model_name if mode == "local_model" else None,
            sources=prepared.sources,
            latency_ms=int((time.perf_counter() - started) * 1000),
            tools_used=prepared.tools_used,
        )

    @staticmethod
    async def generate_stream(
        session: AsyncSession,
        user: User,
        question: str,
        language: str,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        started = time.perf_counter()
        prepared = await AIAdvisorService.prepare(
            session, question, language
        )
        mode = "local_model" if prepared.model_name else "retrieval_only"

        yield {
            "event": "meta",
            "data": {
                "sources": [source.model_dump() for source in prepared.sources],
                "tools_used": prepared.tools_used,
                "mode": mode,
                "model_name": prepared.model_name,
            },
        }

        answer = ""
        if prepared.model_name and prepared.system_prompt:
            chunks: List[str] = []
            try:
                async for chunk in prepared.client.chat_stream(
                    prepared.model_name,
                    prepared.system_prompt,
                    question.strip(),
                ):
                    if not chunk:
                        continue
                    chunks.append(chunk)
                    yield {"event": "token", "data": {"text": chunk}}
            except Exception:
                # Keep any tokens already shown; otherwise use the grounded
                # fallback below.
                pass
            answer = "".join(chunks).strip()
            if answer:
                mode = "local_model"

        if not answer:
            answer = prepared.fallback_answer
            mode = "retrieval_only"
            yield {"event": "token", "data": {"text": answer}}

        latency_ms = int((time.perf_counter() - started) * 1000)
        interaction_id = uuid.uuid4()
        try:
            async with AsyncSessionLocal() as log_session:
                interaction = AIInteraction(
                    user_id=user.id,
                    question=question.strip(),
                    answer=answer,
                    language=language,
                    mode=mode,
                    model_name=prepared.model_name if mode == "local_model" else None,
                    sources=[source.model_dump() for source in prepared.sources],
                    latency_ms=latency_ms,
                )
                log_session.add(interaction)
                await log_session.commit()
                await log_session.refresh(interaction)
                interaction_id = interaction.id
        except Exception:
            # Streaming should still finish even if logging fails.
            pass

        yield {
            "event": "done",
            "data": {
                "interaction_id": str(interaction_id),
                "answer": answer,
                "mode": mode,
                "model_name": prepared.model_name if mode == "local_model" else None,
                "tools_used": prepared.tools_used,
                "suggested_questions": suggested_questions(language),
                "latency_ms": latency_ms,
            },
        }

    @staticmethod
    async def ask(
        session: AsyncSession,
        user: User,
        question: str,
        language: str,
    ) -> AdvisorAnswerOut:
        draft = await AIAdvisorService.generate_answer(
            session, question, language
        )

        interaction = AIInteraction(
            user_id=user.id,
            question=question.strip(),
            answer=draft.answer,
            language=language,
            mode=draft.mode,
            model_name=draft.model_name,
            sources=[source.model_dump() for source in draft.sources],
            latency_ms=draft.latency_ms,
        )
        session.add(interaction)
        await session.commit()
        await session.refresh(interaction)

        return AdvisorAnswerOut(
            interaction_id=interaction.id,
            answer=draft.answer,
            mode=draft.mode,
            model_name=draft.model_name,
            sources=draft.sources,
            suggested_questions=suggested_questions(language),
            latency_ms=draft.latency_ms,
            tools_used=draft.tools_used,
        )

    @staticmethod
    async def set_feedback(
        session: AsyncSession,
        user: User,
        interaction_id: uuid.UUID,
        is_helpful: bool,
    ) -> bool:
        interaction = await session.get(AIInteraction, interaction_id)
        if interaction is None or interaction.user_id != user.id:
            return False
        interaction.is_helpful = is_helpful
        await session.commit()
        return True
