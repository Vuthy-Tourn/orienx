import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.auth import User
from app.models.notifications import NotificationPreference
from app.schemas.common import ApiResponse
from app.schemas.notifications import (
    NotificationSettingsOut,
    NotificationSettingsUpdateIn,
    TelegramLinkOut,
)

router = APIRouter()


def _settings_out(pref: NotificationPreference) -> NotificationSettingsOut:
    return NotificationSettingsOut(
        bot_username=settings.TELEGRAM_BOT_USERNAME,
        telegram_connected=bool(pref.telegram_chat_id),
        telegram_username=pref.telegram_username,
        reminders_enabled=pref.reminders_enabled,
    )


async def _get_or_create_preference(
    db: AsyncSession, user: User
) -> NotificationPreference:
    pref = (
        await db.execute(
            select(NotificationPreference).where(
                NotificationPreference.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if pref:
        return pref

    pref = NotificationPreference(user_id=user.id, reminders_enabled=True)
    db.add(pref)
    await db.commit()
    await db.refresh(pref)
    return pref


@router.get("/settings", response_model=ApiResponse[NotificationSettingsOut])
async def get_notification_settings(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    pref = await _get_or_create_preference(db, current_user)
    return ApiResponse(success=True, data=_settings_out(pref))


@router.patch("/settings", response_model=ApiResponse[NotificationSettingsOut])
async def update_notification_settings(
    body: NotificationSettingsUpdateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    pref = await _get_or_create_preference(db, current_user)
    pref.reminders_enabled = body.reminders_enabled
    await db.commit()
    await db.refresh(pref)
    return ApiResponse(
        success=True,
        message="Notification settings updated",
        data=_settings_out(pref),
    )


@router.post("/telegram/link", response_model=ApiResponse[TelegramLinkOut])
async def create_telegram_link(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_BOT_USERNAME:
        raise HTTPException(
            status_code=503,
            detail="Telegram reminders are not configured",
        )

    pref = await _get_or_create_preference(db, current_user)
    code = secrets.token_urlsafe(24)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.TELEGRAM_LINK_EXPIRE_MINUTES
    )
    pref.telegram_link_code = code
    pref.telegram_link_expires_at = expires_at
    await db.commit()

    deep_link = (
        f"https://t.me/{settings.TELEGRAM_BOT_USERNAME}?start={code}"
    )
    return ApiResponse(
        success=True,
        message="Telegram link created",
        data=TelegramLinkOut(
            deep_link=deep_link,
            bot_username=settings.TELEGRAM_BOT_USERNAME,
            expires_at=expires_at.isoformat(),
        ),
    )


@router.delete("/telegram", response_model=ApiResponse[NotificationSettingsOut])
async def disconnect_telegram(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    pref = await _get_or_create_preference(db, current_user)
    pref.telegram_chat_id = None
    pref.telegram_username = None
    pref.telegram_link_code = None
    pref.telegram_link_expires_at = None
    await db.commit()
    await db.refresh(pref)
    return ApiResponse(
        success=True,
        message="Telegram disconnected",
        data=_settings_out(pref),
    )


@router.post("/telegram/test", response_model=ApiResponse[dict])
async def send_telegram_test(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    pref = await _get_or_create_preference(db, current_user)
    if not pref.telegram_chat_id:
        raise HTTPException(status_code=400, detail="Telegram is not connected")
    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=503, detail="Telegram is not configured")

    text = (
        "✅ OrienX reminders are connected.\n\n"
        "You will receive deadline alerts here for the applications in your plan."
    )
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            json={
                "chat_id": pref.telegram_chat_id,
                "text": text,
                "disable_web_page_preview": True,
            },
        )
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Telegram delivery failed")
    return ApiResponse(success=True, message="Test message sent", data={"sent": True})
