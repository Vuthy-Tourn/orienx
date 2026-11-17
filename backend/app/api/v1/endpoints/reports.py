import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.auth import User
from app.models.report import SharedReport
from app.schemas.common import ApiResponse
from app.schemas.reports import (
    ReportShareCreateIn,
    ReportShareOut,
    SharedReportOut,
)
from app.services.shared_report_service import build_shared_report

router = APIRouter()


def _share_out(share: SharedReport) -> ReportShareOut:
    return ReportShareOut(
        id=share.id,
        token=share.token,
        url=f"/share/{share.token}",
        audience=share.audience,
        language=share.language,
        sections=share.sections or [],
        note=share.note,
        expires_at=share.expires_at,
        revoked_at=share.revoked_at,
        view_count=share.view_count,
        last_viewed_at=share.last_viewed_at,
        created_at=share.created_at,
    )


@router.post("/shares", response_model=ApiResponse[ReportShareOut])
async def create_report_share(
    body: ReportShareCreateIn,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    token = secrets.token_urlsafe(24)
    share = SharedReport(
        user_id=current_user.id,
        token=token,
        audience=body.audience,
        language=body.language,
        sections=list(dict.fromkeys(body.sections)),
        note=(body.note or "").strip() or None,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=body.expires_in_days),
    )
    db.add(share)
    await db.commit()
    await db.refresh(share)
    return ApiResponse(
        success=True,
        message="Report link created",
        data=_share_out(share),
    )


@router.get("/shares", response_model=ApiResponse[list[ReportShareOut]])
async def list_report_shares(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    shares = (
        await db.execute(
            select(SharedReport)
            .where(
                SharedReport.user_id == current_user.id,
                SharedReport.revoked_at.is_(None),
            )
            .order_by(SharedReport.created_at.desc())
        )
    ).scalars().all()
    return ApiResponse(
        success=True,
        data=[_share_out(share) for share in shares],
    )


@router.delete(
    "/shares/{share_id}",
    response_model=ApiResponse[ReportShareOut],
)
async def revoke_report_share(
    share_id: uuid.UUID,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    share = (
        await db.execute(
            select(SharedReport).where(
                SharedReport.id == share_id,
                SharedReport.user_id == current_user.id,
            )
        )
    ).scalar_one_or_none()
    if not share:
        raise HTTPException(status_code=404, detail="Shared report not found")
    if not share.revoked_at:
        share.revoked_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(share)
    return ApiResponse(
        success=True,
        message="Report link revoked",
        data=_share_out(share),
    )


@router.get(
    "/shared/{token}",
    response_model=ApiResponse[SharedReportOut],
)
async def get_shared_report(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    share = (
        await db.execute(
            select(SharedReport).where(
                SharedReport.token == token,
                SharedReport.revoked_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if not share:
        raise HTTPException(status_code=404, detail="Report link not found")
    if share.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Report link has expired")

    share.view_count += 1
    share.last_viewed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(share)

    report = await build_shared_report(db, share)
    return ApiResponse(success=True, data=SharedReportOut(**report))
