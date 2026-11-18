import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.ai import AIInteraction
from app.models.auth import User
from app.schemas.ai import (
    AdvisorAnswerOut,
    AdvisorFeedbackIn,
    AdvisorQuestionIn,
    AdvisorStatusOut,
    AssistantStatusOut,
)
from app.schemas.common import ApiResponse
from app.services.ai_advisor_service import AIAdvisorService
from app.services.gemini_assistant_service import GeminiAssistantService
from app.services.gemini_client import GeminiClient

router = APIRouter()


async def _enforce_daily_limit(
    db: AsyncSession,
    current_user: User,
    limit: Optional[int] = None,
    model_name: Optional[str] = None,
) -> None:
    start_of_day = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    conditions = [
        AIInteraction.user_id == current_user.id,
        AIInteraction.created_at >= start_of_day,
    ]
    if model_name:
        conditions.append(AIInteraction.model_name == model_name)
    used_today = await db.scalar(
        select(func.count(AIInteraction.id)).where(*conditions)
    )
    effective_limit = limit or settings.AI_DAILY_QUESTION_LIMIT
    if (used_today or 0) >= effective_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Daily AI limit reached ({effective_limit} questions). "
                "Please continue tomorrow."
            ),
        )


@router.get("/status", response_model=ApiResponse[AdvisorStatusOut])
async def advisor_status() -> ApiResponse[AdvisorStatusOut]:
    data = await AIAdvisorService.get_status()
    return ApiResponse(success=True, data=data)


@router.get("/assistant/status", response_model=ApiResponse[AssistantStatusOut])
async def assistant_status() -> ApiResponse[AssistantStatusOut]:
    client = GeminiClient()
    return ApiResponse(
        success=True,
        data=AssistantStatusOut(
            configured=client.configured,
            model=client.model,
        ),
    )


@router.post("/assistant", response_model=ApiResponse[AdvisorAnswerOut])
async def ask_assistant(
    body: AdvisorQuestionIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdvisorAnswerOut]:
    await _enforce_daily_limit(
        db,
        current_user,
        limit=settings.ASSISTANT_DAILY_QUESTION_LIMIT,
        model_name=settings.GEMINI_MODEL,
    )
    data = await GeminiAssistantService.ask(
        db, current_user, body.question, body.language
    )
    if data.mode == "gemini":
        message = "Answered by Gemini"
    elif data.warning:
        message = data.warning
    else:
        message = "Answered from verified records"
    return ApiResponse(success=True, message=message, data=data)


@router.post("/advisor", response_model=ApiResponse[AdvisorAnswerOut])
async def ask_advisor(
    body: AdvisorQuestionIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[AdvisorAnswerOut]:
    await _enforce_daily_limit(db, current_user)

    data = await AIAdvisorService.ask(
        db, current_user, body.question, body.language
    )
    message = (
        "Answered by the local AI model"
        if data.mode == "local_model"
        else "Answered from verified records (local AI model offline)"
    )
    return ApiResponse(success=True, message=message, data=data)


@router.post("/advisor/stream")
async def ask_advisor_stream(
    body: AdvisorQuestionIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    await _enforce_daily_limit(db, current_user)

    async def events():
        async for event in AIAdvisorService.generate_stream(
            db, current_user, body.question, body.language
        ):
            payload = json.dumps(event["data"], ensure_ascii=False)
            yield f"event: {event['event']}\ndata: {payload}\n\n"

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/interactions/{interaction_id}/feedback",
    response_model=ApiResponse[Dict[str, Any]],
)
async def advisor_feedback(
    interaction_id: uuid.UUID,
    body: AdvisorFeedbackIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, Any]]:
    updated = await AIAdvisorService.set_feedback(
        db, current_user, interaction_id, body.is_helpful
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI interaction not found",
        )
    return ApiResponse(
        success=True,
        message="Feedback recorded",
        data={"is_helpful": body.is_helpful},
    )
