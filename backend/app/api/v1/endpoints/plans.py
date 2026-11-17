import uuid
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.auth import User
from app.models.catalog import University
from app.models.plan import ApplicationPlan, ApplicationPlanDocument
from app.models.scholarship import Scholarship
from app.schemas.common import ApiResponse
from app.schemas.plan import (
    ApplicationPlanCreateIn,
    ApplicationPlanDocumentCreateIn,
    ApplicationPlanDocumentOut,
    ApplicationPlanDocumentUpdateIn,
    ApplicationPlanOut,
    ApplicationPlanUpdateIn,
)

router = APIRouter()

DOCUMENT_LABELS: Dict[str, Dict[str, str]] = {
    "TRANSCRIPT": {
        "en": "High school transcript",
        "km": "សៀវភៅពិន្ទុវិទ្យាល័យ",
    },
    "BACII_CERTIFICATE": {
        "en": "BacII certificate",
        "km": "សញ្ញាបត្របាក់ឌុប",
    },
    "NATIONAL_ID": {
        "en": "National ID or birth certificate",
        "km": "អត្តសញ្ញាណប័ណ្ណ ឬសំបុត្រកំណើត",
    },
    "PHOTOS": {
        "en": "Passport-size photos",
        "km": "រូបថតទំហំលិខិតឆ្លងដែន",
    },
    "APPLICATION_FORM": {
        "en": "Application form",
        "km": "ពាក្យសុំចូលរៀន",
    },
    "ESSAY": {
        "en": "Essay or statement of purpose",
        "km": "អត្ថបទ ឬសេចក្តីថ្លែងការណ៍",
    },
    "RECOMMENDATION": {
        "en": "Recommendation letter",
        "km": "លិខិតណែនាំ",
    },
    "FEE_RECEIPT": {
        "en": "Application fee receipt",
        "km": "បង្កាន់ដៃបង់ថ្លៃ",
    },
    "ENGLISH_TEST": {
        "en": "English test result",
        "km": "លទ្ធផលតេស្តភាសាអង់គ្លេស",
    },
    "PORTFOLIO": {
        "en": "Portfolio",
        "km": "Portfolio",
    },
    "OTHER": {
        "en": "Other document",
        "km": "ឯកសារផ្សេងៗ",
    },
}

DEFAULT_DOCUMENTS: Dict[str, List[str]] = {
    "UNIVERSITY": [
        "TRANSCRIPT",
        "BACII_CERTIFICATE",
        "NATIONAL_ID",
        "PHOTOS",
        "APPLICATION_FORM",
    ],
    "SCHOLARSHIP": [
        "TRANSCRIPT",
        "BACII_CERTIFICATE",
        "NATIONAL_ID",
        "PHOTOS",
        "APPLICATION_FORM",
        "ESSAY",
        "RECOMMENDATION",
    ],
}


async def _load_target(
    db: AsyncSession, kind: str, target_id: uuid.UUID
) -> Tuple[
    Optional[Any],
    Dict[str, Any],
    Optional[str],
    Optional[str],
    Optional[str],
    Optional[str],
]:
    if kind == "UNIVERSITY":
        university = (
            await db.execute(select(University).where(University.id == target_id))
        ).scalar_one_or_none()
        if not university:
            return None, {}, None, None, None, None
        acronym = university.acronym if isinstance(university.acronym, dict) else {}
        subtitle = " · ".join(
            part
            for part in [
                acronym.get("en") or acronym.get("km"),
                university.province,
            ]
            if part
        )
        return (
            university,
            university.name if isinstance(university.name, dict) else {},
            subtitle or None,
            university.slug,
            university.logo_url,
            university.website_url,
        )

    scholarship = (
        await db.execute(select(Scholarship).where(Scholarship.id == target_id))
    ).scalar_one_or_none()
    if not scholarship:
        return None, {}, None, None, None, None
    provider = scholarship.provider if isinstance(scholarship.provider, dict) else {}
    subtitle = " · ".join(
        part
        for part in [
            provider.get("en") or provider.get("km"),
            scholarship.country_or_institution,
        ]
        if part
    )
    return (
        scholarship,
        scholarship.title if isinstance(scholarship.title, dict) else {},
        subtitle or None,
        scholarship.slug,
        scholarship.poster_url,
        scholarship.official_url,
    )


def _document_out(document: ApplicationPlanDocument) -> ApplicationPlanDocumentOut:
    return ApplicationPlanDocumentOut(
        id=document.id,
        plan_id=document.plan_id,
        document_type=document.document_type,
        name_en=document.name_en,
        name_km=document.name_km,
        is_required=document.is_required,
        is_completed=document.is_completed,
        completed_at=(
            document.completed_at.isoformat() if document.completed_at else None
        ),
        due_date=document.due_date,
        notes=document.notes,
        sort_order=document.sort_order,
    )


async def _plan_out(db: AsyncSession, plan: ApplicationPlan) -> ApplicationPlanOut:
    (
        _target,
        title,
        subtitle,
        slug,
        image_url,
        target_url,
    ) = await _load_target(db, plan.kind, plan.target_id)
    return ApplicationPlanOut(
        id=plan.id,
        kind=plan.kind,
        target_id=plan.target_id,
        target_title=title,
        target_subtitle=subtitle,
        target_slug=slug,
        target_image_url=image_url,
        target_url=target_url,
        status=plan.status,
        deadline=plan.deadline,
        reminder_days=plan.reminder_days,
        notes=plan.notes,
        next_action=plan.next_action,
        documents=[_document_out(document) for document in plan.documents],
        documents_total=len(plan.documents),
        documents_completed=sum(
            1 for document in plan.documents if document.is_completed
        ),
        required_documents_total=sum(
            1 for document in plan.documents if document.is_required
        ),
        required_documents_completed=sum(
            1
            for document in plan.documents
            if document.is_required and document.is_completed
        ),
        next_document_due_date=min(
            (
                document.due_date
                for document in plan.documents
                if document.is_required
                and not document.is_completed
                and document.due_date is not None
            ),
            default=None,
        ),
        created_at=plan.created_at.isoformat() if plan.created_at else "",
        updated_at=plan.updated_at.isoformat() if plan.updated_at else "",
    )


async def _load_plan(
    db: AsyncSession, plan_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[ApplicationPlan]:
    return (
        await db.execute(
            select(ApplicationPlan)
            .options(selectinload(ApplicationPlan.documents))
            .where(
                ApplicationPlan.id == plan_id,
                ApplicationPlan.user_id == user_id,
            )
        )
    ).scalar_one_or_none()


async def _seed_default_documents(
    db: AsyncSession, plan: ApplicationPlan
) -> None:
    existing_types = set(
        (
            await db.execute(
                select(ApplicationPlanDocument.document_type).where(
                    ApplicationPlanDocument.plan_id == plan.id
                )
            )
        ).scalars().all()
    )
    for index, document_type in enumerate(DEFAULT_DOCUMENTS.get(plan.kind, [])):
        if document_type in existing_types:
            continue
        labels = DOCUMENT_LABELS[document_type]
        db.add(
            ApplicationPlanDocument(
                plan_id=plan.id,
                document_type=document_type,
                name_en=labels["en"],
                name_km=labels["km"],
                is_required=True,
                sort_order=index,
            )
        )
    await db.flush()


@router.get("", response_model=ApiResponse[List[ApplicationPlanOut]])
async def list_application_plans(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plans = (
        await db.execute(
            select(ApplicationPlan)
            .options(selectinload(ApplicationPlan.documents))
            .where(ApplicationPlan.user_id == current_user.id)
            .order_by(
                ApplicationPlan.deadline.asc().nulls_last(),
                ApplicationPlan.created_at.desc(),
            )
        )
    ).scalars().all()

    return ApiResponse(
        success=True,
        data=[await _plan_out(db, plan) for plan in plans],
    )


@router.post("", response_model=ApiResponse[ApplicationPlanOut])
async def create_application_plan(
    body: ApplicationPlanCreateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    target, _title, _subtitle, _slug, _image, _target_url = await _load_target(
        db, body.kind, body.target_id
    )
    if target is None:
        raise HTTPException(status_code=404, detail="Application target not found")

    existing = (
        await db.execute(
            select(ApplicationPlan).where(
                ApplicationPlan.user_id == current_user.id,
                ApplicationPlan.kind == body.kind,
                ApplicationPlan.target_id == body.target_id,
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This application is already in your plan",
        )

    deadline = body.deadline
    if deadline is None and body.kind == "SCHOLARSHIP":
        deadline = getattr(target, "application_deadline", None)

    plan = ApplicationPlan(
        user_id=current_user.id,
        kind=body.kind,
        target_id=body.target_id,
        status=body.status,
        deadline=deadline,
        reminder_days=body.reminder_days,
        notes=body.notes,
        next_action=body.next_action,
    )
    db.add(plan)
    try:
        await db.flush()
        plan_id = plan.id
        await _seed_default_documents(db, plan)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="This application is already in your plan",
        )

    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")
    return ApiResponse(
        success=True,
        message="Application added to your plan",
        data=await _plan_out(db, plan),
    )


@router.patch("/{plan_id}", response_model=ApiResponse[ApplicationPlanOut])
async def update_application_plan(
    plan_id: uuid.UUID,
    body: ApplicationPlanUpdateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = (
        await db.execute(
            select(ApplicationPlan).where(
                ApplicationPlan.id == plan_id,
                ApplicationPlan.user_id == current_user.id,
            )
        )
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")

    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(plan, key, value)

    plan_id = plan.id
    await db.commit()
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")
    return ApiResponse(
        success=True,
        message="Application plan updated",
        data=await _plan_out(db, plan),
    )


@router.delete("/{plan_id}", response_model=ApiResponse[Dict[str, Any]])
async def delete_application_plan(
    plan_id: uuid.UUID,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = (
        await db.execute(
            select(ApplicationPlan).where(
                ApplicationPlan.id == plan_id,
                ApplicationPlan.user_id == current_user.id,
            )
        )
    ).scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")

    await db.delete(plan)
    await db.commit()
    return ApiResponse(
        success=True,
        message="Application removed from your plan",
        data={"id": str(plan_id)},
    )


@router.get(
    "/{plan_id}/documents",
    response_model=ApiResponse[List[ApplicationPlanDocumentOut]],
)
async def list_plan_documents(
    plan_id: uuid.UUID,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")
    return ApiResponse(
        success=True,
        data=[_document_out(document) for document in plan.documents],
    )


@router.post(
    "/{plan_id}/documents/defaults",
    response_model=ApiResponse[ApplicationPlanOut],
)
async def add_default_documents(
    plan_id: uuid.UUID,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")

    await _seed_default_documents(db, plan)
    await db.commit()
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")
    return ApiResponse(
        success=True,
        message="Standard checklist added",
        data=await _plan_out(db, plan),
    )


@router.post(
    "/{plan_id}/documents",
    response_model=ApiResponse[ApplicationPlanDocumentOut],
)
async def create_plan_document(
    plan_id: uuid.UUID,
    body: ApplicationPlanDocumentCreateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")

    if body.document_type != "OTHER":
        duplicate = (
            await db.execute(
                select(ApplicationPlanDocument.id).where(
                    ApplicationPlanDocument.plan_id == plan.id,
                    ApplicationPlanDocument.document_type == body.document_type,
                )
            )
        ).scalar_one_or_none()
        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="This document is already in the checklist",
            )

    name_en = (body.name_en or "").strip()
    name_km = (body.name_km or "").strip()
    if body.document_type != "OTHER":
        labels = DOCUMENT_LABELS[body.document_type]
        name_en = name_en or labels["en"]
        name_km = name_km or labels["km"]
    if not name_en and not name_km:
        raise HTTPException(
            status_code=400,
            detail="Provide a document name",
        )

    max_order = (
        await db.execute(
            select(func.max(ApplicationPlanDocument.sort_order)).where(
                ApplicationPlanDocument.plan_id == plan.id
            )
        )
    ).scalar()
    document = ApplicationPlanDocument(
        plan_id=plan.id,
        document_type=body.document_type,
        name_en=name_en or name_km,
        name_km=name_km or None,
        is_required=body.is_required,
        is_completed=False,
        due_date=body.due_date,
        notes=(body.notes or "").strip() or None,
        sort_order=(max_order or 0) + 1,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return ApiResponse(
        success=True,
        message="Document added to the checklist",
        data=_document_out(document),
    )


@router.patch(
    "/{plan_id}/documents/{document_id}",
    response_model=ApiResponse[ApplicationPlanDocumentOut],
)
async def update_plan_document(
    plan_id: uuid.UUID,
    document_id: uuid.UUID,
    body: ApplicationPlanDocumentUpdateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")

    document = (
        await db.execute(
            select(ApplicationPlanDocument).where(
                ApplicationPlanDocument.id == document_id,
                ApplicationPlanDocument.plan_id == plan.id,
            )
        )
    ).scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    updates = body.model_dump(exclude_unset=True)
    if "name_en" in updates:
        value = (updates["name_en"] or "").strip()
        if value:
            document.name_en = value
    if "name_km" in updates:
        document.name_km = (updates["name_km"] or "").strip() or None
    if "is_required" in updates and updates["is_required"] is not None:
        document.is_required = bool(updates["is_required"])
    if "is_completed" in updates and updates["is_completed"] is not None:
        document.is_completed = bool(updates["is_completed"])
        document.completed_at = (
            datetime.now(timezone.utc) if document.is_completed else None
        )
    if "due_date" in updates:
        document.due_date = updates["due_date"]
    if "notes" in updates:
        document.notes = (updates["notes"] or "").strip() or None

    await db.commit()
    await db.refresh(document)
    return ApiResponse(
        success=True,
        message="Checklist item updated",
        data=_document_out(document),
    )


@router.delete(
    "/{plan_id}/documents/{document_id}",
    response_model=ApiResponse[Dict[str, Any]],
)
async def delete_plan_document(
    plan_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plan = await _load_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Application plan not found")

    document = (
        await db.execute(
            select(ApplicationPlanDocument).where(
                ApplicationPlanDocument.id == document_id,
                ApplicationPlanDocument.plan_id == plan.id,
            )
        )
    ).scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    await db.delete(document)
    await db.commit()
    return ApiResponse(
        success=True,
        message="Checklist item removed",
        data={"id": str(document_id)},
    )
