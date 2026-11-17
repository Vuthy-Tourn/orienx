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
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.auth import User
from app.models.catalog import University
from app.models.notifications import NotificationLog, NotificationPreference
from app.models.plan import ApplicationPlan, ApplicationPlanDocument
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


async def _plan_title(db, plan: ApplicationPlan) -> str:
    if plan.kind == "UNIVERSITY":
        university = (
            await db.execute(select(University).where(University.id == plan.target_id))
        ).scalar_one_or_none()
        if university and isinstance(university.name, dict):
            return university.name.get("en") or university.name.get("km") or ""
    else:
        scholarship = (
            await db.execute(
                select(Scholarship).where(Scholarship.id == plan.target_id)
            )
        ).scalar_one_or_none()
        if scholarship and isinstance(scholarship.title, dict):
            return (
                scholarship.title.get("en")
                or scholarship.title.get("km")
                or ""
            )
    return "Application"


async def _plan_language(db, user_id) -> str:
    profile = (
        await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == user_id)
        )
    ).scalar_one_or_none()
    return "km" if (profile.preferred_language if profile else "km") == "km" else "en"


async def send_due_reminders(client: httpx.AsyncClient) -> None:
    today = datetime.now(LOCAL_TZ).date()
    async with AsyncSessionLocal() as db:
        rows = (
            await db.execute(
                select(ApplicationPlan, NotificationPreference)
                .options(selectinload(ApplicationPlan.documents))
                .join(
                    NotificationPreference,
                    NotificationPreference.user_id == ApplicationPlan.user_id,
                )
                .where(
                    NotificationPreference.reminders_enabled == True,
                    NotificationPreference.telegram_chat_id.is_not(None),
                    ApplicationPlan.status.notin_(["ACCEPTED", "REJECTED"]),
                )
            )
        ).all()

        contexts = []
        for plan, pref in rows:
            title = await _plan_title(db, plan)
            language = await _plan_language(db, plan.user_id)
            contexts.append(
                {
                    "id": plan.id,
                    "user_id": plan.user_id,
                    "chat_id": pref.telegram_chat_id,
                    "deadline": plan.deadline,
                    "reminder_days": plan.reminder_days,
                    "status": plan.status,
                    "next_action": plan.next_action,
                    "title": title or "Application",
                    "language": language,
                    "documents": [
                        {
                            "id": document.id,
                            "name_en": document.name_en,
                            "name_km": document.name_km,
                            "is_required": document.is_required,
                            "is_completed": document.is_completed,
                            "due_date": document.due_date,
                        }
                        for document in plan.documents
                    ],
                }
            )

        for context in contexts:
            deadline = context["deadline"]
            if not deadline:
                continue
            days_left = (deadline - today).days
            if days_left < 0 or days_left > context["reminder_days"]:
                continue

            dedupe_key = (
                f"telegram:{context['id']}:{deadline.isoformat()}:"
                f"{context['reminder_days']}"
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

            is_km = context["language"] == "km"
            status_label = STATUS_LABELS[context["language"]].get(
                context["status"], context["status"]
            )
            required_documents = [
                document
                for document in context["documents"]
                if document["is_required"]
            ]
            completed_required = [
                document
                for document in required_documents
                if document["is_completed"]
            ]
            missing_required = [
                document
                for document in required_documents
                if not document["is_completed"]
            ]

            if is_km:
                day_text = "ថ្ងៃនេះ" if days_left == 0 else f"នៅសល់ {days_left} ថ្ងៃ"
                message = (
                    "📅 ការរំលឹកកាលកំណត់ពី OrienX\n\n"
                    f"{context['title']}\n"
                    f"កាលកំណត់៖ {deadline.isoformat()} ({day_text})\n"
                    f"ស្ថានភាព៖ {status_label}\n"
                )
                if required_documents:
                    message += (
                        f"ឯកសារ៖ {len(completed_required)}/{len(required_documents)} "
                        "បានបញ្ចប់\n"
                    )
                    if missing_required:
                        names = [
                            document["name_km"] or document["name_en"]
                            for document in missing_required[:4]
                        ]
                        message += f"ខ្វះ៖ {', '.join(names)}\n"
                if context["next_action"]:
                    message += f"ជំហានបន្ទាប់៖ {context['next_action']}\n"
                message += f"\nបើកផែនការ៖ {settings.FRONTEND_URL}/dashboard/plan"
            else:
                day_text = "today" if days_left == 0 else f"{days_left} days left"
                message = (
                    "📅 OrienX deadline reminder\n\n"
                    f"{context['title']}\n"
                    f"Deadline: {deadline.isoformat()} ({day_text})\n"
                    f"Status: {status_label}\n"
                )
                if required_documents:
                    message += (
                        f"Documents: {len(completed_required)}/"
                        f"{len(required_documents)} complete\n"
                    )
                    if missing_required:
                        names = [
                            document["name_en"] or document["name_km"]
                            for document in missing_required[:4]
                        ]
                        message += f"Missing: {', '.join(names)}\n"
                if context["next_action"]:
                    message += f"Next step: {context['next_action']}\n"
                message += f"\nOpen My Plan: {settings.FRONTEND_URL}/dashboard/plan"

            sent = await send_message(client, context["chat_id"], message)
            if sent:
                db.add(
                    NotificationLog(
                        user_id=context["user_id"],
                        plan_id=context["id"],
                        channel="telegram",
                        dedupe_key=dedupe_key,
                        message=message,
                    )
                )
                await db.commit()
                logger.info(
                    "Sent reminder for plan %s to %s",
                    context["id"],
                    context["chat_id"],
                )

        for context in contexts:
            is_km = context["language"] == "km"
            for document in context["documents"]:
                due_date = document["due_date"]
                if document["is_completed"] or not due_date:
                    continue
                days_left = (due_date - today).days
                if days_left > context["reminder_days"] or days_left < -3:
                    continue

                dedupe_key = (
                    f"telegram:doc:{document['id']}:{due_date.isoformat()}:"
                    f"{context['reminder_days']}"
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

                document_name = (
                    document["name_km"] or document["name_en"]
                    if is_km
                    else document["name_en"] or document["name_km"]
                )
                if days_left < 0:
                    day_text = (
                        f"ហួសកំណត់ {abs(days_left)} ថ្ងៃ"
                        if is_km
                        else f"overdue by {abs(days_left)} days"
                    )
                elif days_left == 0:
                    day_text = "ថ្ងៃនេះ" if is_km else "today"
                else:
                    day_text = (
                        f"នៅសល់ {days_left} ថ្ងៃ"
                        if is_km
                        else f"{days_left} days left"
                    )

                if is_km:
                    message = (
                        "📄 ការរំលឹកឯកសារ OrienX\n\n"
                        f"{context['title']}\n"
                        f"ឯកសារ៖ {document_name}\n"
                        f"កាលកំណត់៖ {due_date.isoformat()} ({day_text})\n"
                        f"\nបើកផែនការ៖ {settings.FRONTEND_URL}/dashboard/plan"
                    )
                else:
                    message = (
                        "📄 OrienX document reminder\n\n"
                        f"{context['title']}\n"
                        f"Document: {document_name}\n"
                        f"Due: {due_date.isoformat()} ({day_text})\n"
                        f"\nOpen My Plan: {settings.FRONTEND_URL}/dashboard/plan"
                    )

                sent = await send_message(client, context["chat_id"], message)
                if sent:
                    db.add(
                        NotificationLog(
                            user_id=context["user_id"],
                            plan_id=context["id"],
                            channel="telegram",
                            dedupe_key=dedupe_key,
                            message=message,
                        )
                    )
                    await db.commit()
                    logger.info(
                        "Sent document reminder for %s to %s",
                        document["id"],
                        context["chat_id"],
                    )


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
