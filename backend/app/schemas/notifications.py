import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class NotificationSettingsOut(BaseModel):
    bot_username: str = ""
    telegram_connected: bool = False
    telegram_username: Optional[str] = None
    reminders_enabled: bool = True

    model_config = ConfigDict(extra="ignore")


class NotificationSettingsUpdateIn(BaseModel):
    reminders_enabled: bool

    model_config = ConfigDict(extra="forbid")


class TelegramLinkOut(BaseModel):
    deep_link: str
    bot_username: str
    expires_at: str

    model_config = ConfigDict(extra="ignore")


class InAppNotificationOut(BaseModel):
    id: uuid.UUID
    category: str
    title_en: str
    title_km: Optional[str] = None
    message_en: str
    message_km: Optional[str] = None
    href: Optional[str] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(extra="ignore")


class InAppNotificationListOut(BaseModel):
    items: List[InAppNotificationOut]
    total: int
    unread_count: int
    page: int
    page_size: int
    has_more: bool


class InAppNotificationSummaryOut(BaseModel):
    unread_count: int
    items: List[InAppNotificationOut]


class InAppNotificationUpdateIn(BaseModel):
    is_read: bool

    model_config = ConfigDict(extra="forbid")


class InAppNotificationReadAllOut(BaseModel):
    updated: int
