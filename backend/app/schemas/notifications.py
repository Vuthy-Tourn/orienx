from typing import Optional

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
