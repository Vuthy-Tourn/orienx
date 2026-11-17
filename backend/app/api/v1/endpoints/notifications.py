import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.auth import User
from app.models.notifications import InAppNotification, NotificationPreference
from app.schemas.common import ApiResponse
from app.schemas.notifications import (
    InAppNotificationListOut,
    InAppNotificationOut,
    InAppNotificationReadAllOut,
    InAppNotificationSummaryOut,
    InAppNotificationUpdateIn,
    NotificationSettingsOut,
    NotificationSettingsUpdateIn,
    TelegramLinkOut,
)
from app.services.in_app_notifications import sync_user_notifications

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


# =========================================================================
# In-app notification center
# =========================================================================

NOTIFICATION_CATEGORIES = {
    "DEADLINE",
    "DOCUMENT",
    "SCHOLARSHIP",
    "SYSTEM",
}


def _notification_out(
    notification: InAppNotification,
) -> InAppNotificationOut:
    return InAppNotificationOut(
        id=notification.id,
        category=notification.category,
        title_en=notification.title_en,
        title_km=notification.title_km,
        message_en=notification.message_en,
        message_km=notification.message_km,
        href=notification.href,
        is_read=notification.is_read,
        read_at=notification.read_at,
        created_at=notification.created_at,
    )


@router.get(
    "/summary",
    response_model=ApiResponse[InAppNotificationSummaryOut],
)
async def notification_summary(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    await sync_user_notifications(db, current_user.id)

    unread_count = (
        await db.execute(
            select(func.count())
            .select_from(InAppNotification)
            .where(
                InAppNotification.user_id == current_user.id,
                InAppNotification.is_read == False,
            )
        )
    ).scalar_one()
    items = (
        await db.execute(
            select(InAppNotification)
            .where(InAppNotification.user_id == current_user.id)
            .order_by(
                InAppNotification.created_at.desc(),
                InAppNotification.id.desc(),
            )
            .limit(5)
        )
    ).scalars().all()

    return ApiResponse(
        success=True,
        data=InAppNotificationSummaryOut(
            unread_count=int(unread_count or 0),
            items=[_notification_out(item) for item in items],
        ),
    )


@router.post(
    "/read-all",
    response_model=ApiResponse[InAppNotificationReadAllOut],
)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        update(InAppNotification)
        .where(
            InAppNotification.user_id == current_user.id,
            InAppNotification.is_read == False,
        )
        .values(
            is_read=True,
            read_at=datetime.now(timezone.utc),
        )
    )
    await db.commit()
    return ApiResponse(
        success=True,
        message="All notifications marked as read",
        data=InAppNotificationReadAllOut(updated=result.rowcount or 0),
    )


@router.get("", response_model=ApiResponse[InAppNotificationListOut])
async def list_notifications(
    status_filter: str = Query("all", alias="status"),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    if status_filter not in {"all", "unread", "read"}:
        raise HTTPException(status_code=400, detail="Invalid notification status")
    normalized_category = category.upper() if category else None
    if (
        normalized_category
        and normalized_category not in NOTIFICATION_CATEGORIES
    ):
        raise HTTPException(status_code=400, detail="Invalid notification category")

    await sync_user_notifications(db, current_user.id)

    conditions = [InAppNotification.user_id == current_user.id]
    if status_filter == "unread":
        conditions.append(InAppNotification.is_read == False)
    elif status_filter == "read":
        conditions.append(InAppNotification.is_read == True)
    if normalized_category:
        conditions.append(InAppNotification.category == normalized_category)

    total = (
        await db.execute(
            select(func.count())
            .select_from(InAppNotification)
            .where(*conditions)
        )
    ).scalar_one()
    unread_count = (
        await db.execute(
            select(func.count())
            .select_from(InAppNotification)
            .where(
                InAppNotification.user_id == current_user.id,
                InAppNotification.is_read == False,
            )
        )
    ).scalar_one()
    items = (
        await db.execute(
            select(InAppNotification)
            .where(*conditions)
            .order_by(
                InAppNotification.created_at.desc(),
                InAppNotification.id.desc(),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    return ApiResponse(
        success=True,
        data=InAppNotificationListOut(
            items=[_notification_out(item) for item in items],
            total=int(total or 0),
            unread_count=int(unread_count or 0),
            page=page,
            page_size=page_size,
            has_more=page * page_size < int(total or 0),
        ),
    )


@router.patch(
    "/{notification_id}",
    response_model=ApiResponse[InAppNotificationOut],
)
async def update_notification(
    notification_id: uuid.UUID,
    body: InAppNotificationUpdateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    notification = (
        await db.execute(
            select(InAppNotification).where(
                InAppNotification.id == notification_id,
                InAppNotification.user_id == current_user.id,
            )
        )
    ).scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = body.is_read
    notification.read_at = (
        datetime.now(timezone.utc) if body.is_read else None
    )
    await db.commit()
    await db.refresh(notification)
    return ApiResponse(
        success=True,
        data=_notification_out(notification),
    )


@router.delete(
    "/{notification_id}",
    response_model=ApiResponse[dict],
)
async def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    notification = (
        await db.execute(
            select(InAppNotification).where(
                InAppNotification.id == notification_id,
                InAppNotification.user_id == current_user.id,
            )
        )
    ).scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    await db.delete(notification)
    await db.commit()
    return ApiResponse(
        success=True,
        message="Notification deleted",
        data={"id": str(notification_id)},
    )
