"""Telegram linking and deadline reminder worker.

Run from the backend directory:
    PYTHONPATH=. ./venv/bin/python scripts/telegram_worker.py
"""

import asyncio
import logging
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import httpx
from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.auth import User
from app.models.catalog import University
from app.models.notifications import NotificationLog, NotificationPreference
from app.models.plan import ApplicationPlan
from app.models.profile import StudentProfile
from app.models.scholarship import Scholarship

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
# httpx logs full request URLs, which would expose the bot token.
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger("telegram-worker")

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"
LOCAL_TZ = ZoneInfo("Asia/Phnom_Penh")

STATUS_LABELS = {
    "km": {
        "RESEARCHING": "កំពុងស្រាវជ្រាវ",
        "PREPARING": "កំពុងត្រៀម",
        "SUBMITTED": "បានដាក់ពាក្យ",
        "INTERVIEW": "សម្ភាសន៍",
        "ACCEPTED": "បានទទួលយក",
        "WAITLISTED": "បញ្ជីរង់ចាំ",
        "REJECTED": "មិនបានទទួលយក",
    },
    "en": {
        "RESEARCHING": "Researching",
        "PREPARING": "Preparing",
        "SUBMITTED": "Submitted",
        "INTERVIEW": "Interview",
        "ACCEPTED": "Accepted",
        "WAITLISTED": "Waitlisted",
        "REJECTED": "Rejected",
    },
}


async def telegram_request(
    client: httpx.AsyncClient, method: str, payload: dict
) -> dict:
    response = await client.post(
        TELEGRAM_API.format(token=settings.TELEGRAM_BOT_TOKEN, method=method),
        json=payload,
    )
    data = response.json()
    if not data.get("ok"):
        logger.warning(
            "Telegram %s failed: %s", method, data.get("description", response.text)
        )
    return data


async def send_message(
    client: httpx.AsyncClient, chat_id: str, text: str
) -> bool:
    data = await telegram_request(
        client,
        "sendMessage",
        {
            "chat_id": chat_id,
            "text": text,
            "disable_web_page_preview": True,
        },
    )
    return bool(data.get("ok"))


async def handle_update(client: httpx.AsyncClient, update: dict) -> None:
    message = update.get("message") or update.get("edited_message")
    if not message:
        return
    text = (message.get("text") or "").strip()
    chat = message.get("chat") or {}
    chat_id = str(chat.get("id") or "")
    username = message.get("from", {}).get("username")
    if not chat_id or not text.startswith("/"):
        return

    command, _, argument = text.partition(" ")
    command = command.split("@")[0].lower()
    argument = argument.strip()

    async with AsyncSessionLocal() as db:
        if command == "/start":
            if not argument:
                existing = (
                    await db.execute(
                        select(NotificationPreference).where(
                            NotificationPreference.telegram_chat_id == chat_id
                        )
                    )
                ).scalar_one_or_none()
                if existing:
                    existing.reminders_enabled = True
                    await db.commit()
                    await send_message(
                        client,
                        chat_id,
                        "✅ OrienX reminders are active. You will receive deadline alerts here.",
                    )
                else:
                    await send_message(
                        client,
                        chat_id,
                        "To connect OrienX reminders, open My Plan in OrienX and "
                        "press “Connect Telegram”. Then return here and press Start.",
                    )
                return

            pref = (
                await db.execute(
                    select(NotificationPreference).where(
                        NotificationPreference.telegram_link_code == argument
                    )
                )
            ).scalar_one_or_none()
            now = datetime.now(timezone.utc)
            if (
                not pref
                or not pref.telegram_link_expires_at
                or pref.telegram_link_expires_at < now
            ):
                if pref:
                    pref.telegram_link_code = None
                    pref.telegram_link_expires_at = None
                    await db.commit()
                await send_message(
                    client,
                    chat_id,
                    "This Telegram link has expired. Open My Plan in OrienX "
                    "and generate a new link.",
                )
                return

            # A Telegram account can only belong to one OrienX user.
            previous = (
                await db.execute(
                    select(NotificationPreference).where(
                        NotificationPreference.telegram_chat_id == chat_id,
                        NotificationPreference.user_id != pref.user_id,
                    )
                )
            ).scalar_one_or_none()
            if previous:
                previous.telegram_chat_id = None
                previous.telegram_username = None

            pref.telegram_chat_id = chat_id
            pref.telegram_username = username
            pref.telegram_link_code = None
            pref.telegram_link_expires_at = None
            pref.reminders_enabled = True
            await db.commit()

            await send_message(
                client,
                chat_id,
                "✅ OrienX deadline reminders are connected.\n"
                "You will receive alerts here for applications in My Plan.\n\n"
                "Send /stop to pause alerts or /status to check your connection.",
            )
            logger.info("Linked Telegram chat %s to user %s", chat_id, pref.user_id)
            return

        pref = (
            await db.execute(
                select(NotificationPreference).where(
                    NotificationPreference.telegram_chat_id == chat_id
                )
            )
        ).scalar_one_or_none()

        if command == "/stop":
            if pref:
                pref.reminders_enabled = False
                await db.commit()
                await send_message(
                    client, chat_id, "⏸ OrienX reminders are paused. Send /start to resume."
                )
            else:
                await send_message(
                    client, chat_id, "This Telegram account is not connected to OrienX."
                )
            return

        if command in {"/status", "/start"}:
            if pref:
                pref.reminders_enabled = True
                await db.commit()
                await send_message(
                    client,
                    chat_id,
                    "✅ OrienX reminders are active. You will receive deadline alerts here.",
                )
            else:
                await send_message(
                    client,
                    chat_id,
                    "This Telegram account is not connected. Open My Plan in OrienX "
                    "and press “Connect Telegram”.",
                )


async def send_due_reminders(client: httpx.AsyncClient) -> None:
    today = datetime.now(LOCAL_TZ).date()
    async with AsyncSessionLocal() as db:
        rows = (
            await db.execute(
                select(ApplicationPlan, NotificationPreference)
                .join(
                    NotificationPreference,
                    NotificationPreference.user_id == ApplicationPlan.user_id,
                )
                .where(
                    NotificationPreference.reminders_enabled == True,
                    NotificationPreference.telegram_chat_id.is_not(None),
                    ApplicationPlan.deadline.is_not(None),
                    ApplicationPlan.status.notin_(["ACCEPTED", "REJECTED"]),
                )
            )
        ).all()

        for plan, pref in rows:
            days_left = (plan.deadline - today).days
            if days_left < 0 or days_left > plan.reminder_days:
                continue

            dedupe_key = (
                f"telegram:{plan.id}:{plan.deadline.isoformat()}:{plan.reminder_days}"
            )
            already_sent = (
                await db.execute(
                    select(NotificationLog.id).where(
                        NotificationLog.dedupe_key == dedupe_key
                    )
                )
            ).scalar_one_or_none()
            if already_sent:
                continue

            title = ""
            if plan.kind == "UNIVERSITY":
                university = (
                    await db.execute(
                        select(University).where(University.id == plan.target_id)
                    )
                ).scalar_one_or_none()
                if university and isinstance(university.name, dict):
                    title = university.name.get("en") or university.name.get("km") or ""
            else:
                scholarship = (
                    await db.execute(
                        select(Scholarship).where(Scholarship.id == plan.target_id)
                    )
                ).scalar_one_or_none()
                if scholarship and isinstance(scholarship.title, dict):
                    title = (
                        scholarship.title.get("en")
                        or scholarship.title.get("km")
                        or ""
                    )
            if not title:
                title = "Application"

            profile = (
                await db.execute(
                    select(StudentProfile).where(
                        StudentProfile.user_id == plan.user_id
                    )
                )
            ).scalar_one_or_none()
            is_km = (profile.preferred_language if profile else "km") == "km"
            language_key = "km" if is_km else "en"
            status_label = STATUS_LABELS[language_key].get(plan.status, plan.status)

            if is_km:
                day_text = "ថ្ងៃនេះ" if days_left == 0 else f"នៅសល់ {days_left} ថ្ងៃ"
                message = (
                    "📅 ការរំលឹកកាលកំណត់ពី OrienX\n\n"
                    f"{title}\n"
                    f"កាលកំណត់៖ {plan.deadline.isoformat()} ({day_text})\n"
                    f"ស្ថានភាព៖ {status_label}\n"
                )
                if plan.next_action:
                    message += f"ជំហានបន្ទាប់៖ {plan.next_action}\n"
                message += f"\nបើកផែនការ៖ {settings.FRONTEND_URL}/dashboard/plan"
            else:
                day_text = "today" if days_left == 0 else f"{days_left} days left"
                message = (
                    "📅 OrienX deadline reminder\n\n"
                    f"{title}\n"
                    f"Deadline: {plan.deadline.isoformat()} ({day_text})\n"
                    f"Status: {status_label}\n"
                )
                if plan.next_action:
                    message += f"Next step: {plan.next_action}\n"
                message += f"\nOpen My Plan: {settings.FRONTEND_URL}/dashboard/plan"

            sent = await send_message(client, pref.telegram_chat_id, message)
            if sent:
                db.add(
                    NotificationLog(
                        user_id=plan.user_id,
                        plan_id=plan.id,
                        channel="telegram",
                        dedupe_key=dedupe_key,
                        message=message,
                    )
                )
                await db.commit()
                logger.info("Sent reminder for plan %s to %s", plan.id, pref.telegram_chat_id)


async def poll_updates(client: httpx.AsyncClient, offset: int) -> int:
    data = await telegram_request(
        client,
        "getUpdates",
        {
            "offset": offset,
            "timeout": 15,
            "allowed_updates": ["message", "edited_message"],
        },
    )
    if not data.get("ok"):
        return offset
    for update in data.get("result", []):
        try:
            await handle_update(client, update)
        except Exception:
            logger.exception("Failed to handle Telegram update")
        offset = max(offset, int(update.get("update_id", 0)) + 1)
    return offset


async def main() -> None:
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not configured")
        return

    logger.info("Telegram worker started for @%s", settings.TELEGRAM_BOT_USERNAME)
    offset = 0
    last_reminder_sweep = 0.0
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            try:
                offset = await poll_updates(client, offset)
            except Exception:
                logger.exception("Telegram polling failed")

            now = asyncio.get_running_loop().time()
            if now - last_reminder_sweep >= settings.TELEGRAM_REMINDER_INTERVAL_SECONDS:
                try:
                    await send_due_reminders(client)
                except Exception:
                    logger.exception("Reminder sweep failed")
                last_reminder_sweep = now

            await asyncio.sleep(settings.TELEGRAM_POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    asyncio.run(main())
