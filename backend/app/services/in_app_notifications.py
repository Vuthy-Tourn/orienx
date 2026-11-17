"""Create in-app notifications for application-plan deadlines and documents."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.catalog import University
from app.models.notifications import InAppNotification
from app.models.plan import ApplicationPlan
from app.models.scholarship import Scholarship

LOCAL_TZ = ZoneInfo("Asia/Phnom_Penh")
REMINDER_OVERDUE_DAYS = 3


def _localized(value: Any) -> tuple[str, str]:
    if isinstance(value, dict):
        en = str(value.get("en") or value.get("km") or "").strip()
        km = str(value.get("km") or value.get("en") or "").strip()
        return en, km
    text = str(value or "").strip()
    return text, text


def _day_text(days_left: int, is_km: bool) -> str:
    if days_left < 0:
        days = abs(days_left)
        return f"ហួសកំណត់ {days} ថ្ងៃ" if is_km else f"overdue by {days} days"
    if days_left == 0:
        return "ផុតកំណត់ថ្ងៃនេះ" if is_km else "due today"
    return (
        f"នៅសល់ {days_left} ថ្ងៃ"
        if is_km
        else f"{days_left} days left"
    )


def _deadline_candidate(
    plan: ApplicationPlan,
    title_en: str,
    title_km: str,
    days_left: int,
) -> Dict[str, Any]:
    is_scholarship = plan.kind == "SCHOLARSHIP"
    if is_scholarship:
        heading_en = "Scholarship deadline approaching"
        heading_km = "កាលកំណត់អាហារូបករណ៍ជិតមកដល់"
    else:
        heading_en = "Application deadline approaching"
        heading_km = "កាលកំណត់ដាក់ពាក្យជិតមកដល់"

    deadline = plan.deadline
    assert deadline is not None
    return {
        "id": uuid.uuid4(),
        "user_id": plan.user_id,
        "plan_id": plan.id,
        "category": "SCHOLARSHIP" if is_scholarship else "DEADLINE",
        "title_en": heading_en,
        "title_km": heading_km,
        "message_en": (
            f"{title_en} — {_day_text(days_left, False)}. "
            f"Deadline: {deadline.isoformat()}."
        ),
        "message_km": (
            f"{title_km} — {_day_text(days_left, True)}។ "
            f"កាលកំណត់៖ {deadline.isoformat()}។"
        ),
        "href": "/dashboard/plan",
        "dedupe_key": (
            f"plan:{plan.id}:{deadline.isoformat()}:{plan.reminder_days}"
        ),
        "is_read": False,
        "read_at": None,
        "created_at": datetime.now(LOCAL_TZ),
    }


def _document_candidate(
    plan: ApplicationPlan,
    document: Any,
    title_en: str,
    title_km: str,
    days_left: int,
) -> Dict[str, Any]:
    due_date = document.due_date
    assert due_date is not None
    document_en = document.name_en or document.name_km or "Document"
    document_km = document.name_km or document.name_en or "ឯកសារ"
    return {
        "id": uuid.uuid4(),
        "user_id": plan.user_id,
        "plan_id": plan.id,
        "category": "DOCUMENT",
        "title_en": "Document due soon",
        "title_km": "ឯកសារត្រូវដាក់ឆាប់ៗ",
        "message_en": (
            f"{document_en} for {title_en} — {_day_text(days_left, False)}. "
            f"Due: {due_date.isoformat()}."
        ),
        "message_km": (
            f"{document_km} សម្រាប់ {title_km} — {_day_text(days_left, True)}។ "
            f"កំណត់ថ្ងៃ៖ {due_date.isoformat()}។"
        ),
        "href": "/dashboard/plan",
        "dedupe_key": (
            f"doc:{document.id}:{due_date.isoformat()}:{plan.reminder_days}"
        ),
        "is_read": False,
        "read_at": None,
        "created_at": datetime.now(LOCAL_TZ),
    }


def _welcome_candidate(user_id: uuid.UUID) -> Dict[str, Any]:
    return {
        "id": uuid.uuid4(),
        "user_id": user_id,
        "plan_id": None,
        "category": "SYSTEM",
        "title_en": "Welcome to your notification center",
        "title_km": "សូមស្វាគមន៍មកកាន់មជ្ឈមណ្ឌលជូនដំណឹង",
        "message_en": (
            "Deadline and document reminders for your application plans "
            "will appear here."
        ),
        "message_km": (
            "ការរំលឹកកាលកំណត់ និងឯកសារសម្រាប់ផែនការដាក់ពាក្យរបស់អ្នក "
            "នឹងបង្ហាញនៅទីនេះ។"
        ),
        "href": "/dashboard/plan",
        "dedupe_key": "welcome:v1",
        "is_read": False,
        "read_at": None,
        "created_at": datetime.now(LOCAL_TZ),
    }


async def _titles_for_plans(
    db: AsyncSession, plans: List[ApplicationPlan]
) -> Dict[uuid.UUID, tuple[str, str]]:
    university_ids = {
        plan.target_id for plan in plans if plan.kind == "UNIVERSITY"
    }
    scholarship_ids = {
        plan.target_id for plan in plans if plan.kind == "SCHOLARSHIP"
    }

    titles: Dict[uuid.UUID, tuple[str, str]] = {}
    if university_ids:
        universities = (
            await db.execute(
                select(University).where(University.id.in_(university_ids))
            )
        ).scalars()
        for university in universities:
            titles[university.id] = _localized(university.name)

    if scholarship_ids:
        scholarships = (
            await db.execute(
                select(Scholarship).where(Scholarship.id.in_(scholarship_ids))
            )
        ).scalars()
        for scholarship in scholarships:
            titles[scholarship.id] = _localized(scholarship.title)

    return titles


async def sync_user_notifications(
    db: AsyncSession, user_id: uuid.UUID
) -> int:
    """Generate any missing in-app reminders for one user.

    Safe to call from read endpoints: dedupe keys make repeated calls
    idempotent, and PostgreSQL ``ON CONFLICT DO NOTHING`` covers races.
    """

    plans = (
        await db.execute(
            select(ApplicationPlan)
            .options(selectinload(ApplicationPlan.documents))
            .where(
                ApplicationPlan.user_id == user_id,
                ApplicationPlan.status.notin_(["ACCEPTED", "REJECTED"]),
            )
        )
    ).scalars().all()

    titles = await _titles_for_plans(db, plans)
    today = datetime.now(LOCAL_TZ).date()
    candidates: List[Dict[str, Any]] = []

    for plan in plans:
        title_en, title_km = titles.get(
            plan.target_id, ("Application", "ការដាក់ពាក្យ")
        )
        reminder_days = max(0, plan.reminder_days or 0)

        if plan.deadline:
            days_left = (plan.deadline - today).days
            if -REMINDER_OVERDUE_DAYS <= days_left <= reminder_days:
                candidates.append(
                    _deadline_candidate(plan, title_en, title_km, days_left)
                )

        for document in plan.documents:
            if not document.is_required or document.is_completed:
                continue
            if not document.due_date:
                continue
            days_left = (document.due_date - today).days
            if -REMINDER_OVERDUE_DAYS <= days_left <= reminder_days:
                candidates.append(
                    _document_candidate(
                        plan, document, title_en, title_km, days_left
                    )
                )

    has_any = (
        await db.execute(
            select(InAppNotification.id)
            .where(InAppNotification.user_id == user_id)
            .limit(1)
        )
    ).first()
    if not has_any:
        candidates.append(_welcome_candidate(user_id))

    if not candidates:
        return 0

    existing_keys = set(
        (
            await db.execute(
                select(InAppNotification.dedupe_key).where(
                    InAppNotification.user_id == user_id,
                    InAppNotification.dedupe_key.in_(
                        [candidate["dedupe_key"] for candidate in candidates]
                    ),
                )
            )
        ).scalars()
    )
    rows = [
        candidate
        for candidate in candidates
        if candidate["dedupe_key"] not in existing_keys
    ]
    if not rows:
        return 0

    result = await db.execute(
        pg_insert(InAppNotification)
        .values(rows)
        .on_conflict_do_nothing(
            constraint="uq_in_app_notification_dedupe"
        )
    )
    await db.commit()
    return result.rowcount or 0
