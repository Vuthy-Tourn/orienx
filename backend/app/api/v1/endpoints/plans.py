import uuid
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.auth import User
from app.models.catalog import University
from app.models.plan import ApplicationPlan
from app.models.scholarship import Scholarship
from app.schemas.common import ApiResponse
from app.schemas.plan import (
    ApplicationPlanCreateIn,
    ApplicationPlanOut,
    ApplicationPlanUpdateIn,
)

router = APIRouter()


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
        created_at=plan.created_at.isoformat() if plan.created_at else "",
        updated_at=plan.updated_at.isoformat() if plan.updated_at else "",
    )


@router.get("", response_model=ApiResponse[List[ApplicationPlanOut]])
async def list_application_plans(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    plans = (
        await db.execute(
            select(ApplicationPlan)
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
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="This application is already in your plan",
        )

    await db.refresh(plan)
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

    await db.commit()
    await db.refresh(plan)
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
