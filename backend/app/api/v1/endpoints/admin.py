import re
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.auth import AuditLog, RefreshToken, User, Role
from app.models.profile import StudentProfile
from app.models.catalog import University, Major, Career
from app.models.scholarship import Scholarship
from app.models.assessment import PersonalityAssessment, RiasecAssessment
from app.models.recommendation import MajorRecommendation, RecommendationRule
from app.schemas.admin import (
    AdminAnalyticsOut,
    CareerAdminIn,
    MajorAdminIn,
    RuleUpdateIn,
    ScholarshipAdminIn,
    UniversityAdminIn,
    UserManagementOut,
    UserRolesUpdateIn,
    UserStatusUpdateIn,
)
from app.schemas.recommendation import RecommendationRuleOut
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/analytics", response_model=ApiResponse[AdminAnalyticsOut])
async def get_admin_analytics(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    # Counts
    total_students = (await db.execute(select(func.count(StudentProfile.id)))).scalar() or 0
    total_unis = (await db.execute(select(func.count(University.id)))).scalar() or 0
    total_majors = (await db.execute(select(func.count(Major.id)))).scalar() or 0
    total_careers = (await db.execute(select(func.count(Career.id)))).scalar() or 0
    total_scholarships = (await db.execute(select(func.count(Scholarship.id)))).scalar() or 0

    c_pers = (await db.execute(select(func.count(PersonalityAssessment.id)).where(PersonalityAssessment.status == "COMPLETED"))).scalar() or 0
    c_ria = (await db.execute(select(func.count(RiasecAssessment.id)).where(RiasecAssessment.status == "COMPLETED"))).scalar() or 0
    c_recs = (await db.execute(select(func.count(MajorRecommendation.id)))).scalar() or 0

    # Popular majors
    stmt_pop_maj = (
        select(Major.name, func.count(MajorRecommendation.id).label("rec_count"))
        .join(MajorRecommendation, MajorRecommendation.major_id == Major.id)
        .group_by(Major.name)
        .order_by(func.count(MajorRecommendation.id).desc())
        .limit(5)
    )
    res_pop_maj = await db.execute(stmt_pop_maj)
    popular_majors = [{"name": row[0], "count": row[1]} for row in res_pop_maj.fetchall()]

    # Popular universities
    stmt_pop_uni = (
        select(University.name, University.acronym)
        .limit(5)
    )
    res_pop_uni = await db.execute(stmt_pop_uni)
    popular_unis = [{"name": row[0], "acronym": row[1]} for row in res_pop_uni.fetchall()]

    # Last six calendar months, oldest first
    now = datetime.now(timezone.utc)
    year, month = now.year, now.month
    month_keys: List[str] = []
    for _ in range(6):
        month_keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    month_keys.reverse()

    async def monthly_counts(column, model, *filters) -> Dict[str, int]:
        stmt = (
            select(func.to_char(column, "YYYY-MM").label("month"), func.count())
            .select_from(model)
            .group_by("month")
        )
        for condition in filters:
            stmt = stmt.where(condition)
        rows = await db.execute(stmt)
        return {row[0]: row[1] for row in rows.fetchall()}

    registrations_monthly = await monthly_counts(User.created_at, User)
    personality_monthly = await monthly_counts(
        PersonalityAssessment.created_at,
        PersonalityAssessment,
        PersonalityAssessment.status == "COMPLETED",
    )
    riasec_monthly = await monthly_counts(
        RiasecAssessment.created_at,
        RiasecAssessment,
        RiasecAssessment.status == "COMPLETED",
    )
    recommendations_monthly = await monthly_counts(
        MajorRecommendation.generated_at, MajorRecommendation
    )

    assessments_monthly = {
        key: personality_monthly.get(key, 0) + riasec_monthly.get(key, 0)
        for key in set(personality_monthly) | set(riasec_monthly)
    }
    registrations_by_month = [
        {"month": key, "count": registrations_monthly.get(key, 0)} for key in month_keys
    ]
    assessments_by_month = [
        {"month": key, "count": assessments_monthly.get(key, 0)} for key in month_keys
    ]
    recommendations_by_month = [
        {"month": key, "count": recommendations_monthly.get(key, 0)}
        for key in month_keys
    ]

    role_rows = await db.execute(
        select(Role.name, func.count(User.id))
        .join(Role.users)
        .group_by(Role.name)
    )
    users_by_role = [{"role": row[0], "count": row[1]} for row in role_rows.fetchall()]

    return ApiResponse(
        success=True,
        data=AdminAnalyticsOut(
            total_students=total_students,
            total_universities=total_unis,
            total_majors=total_majors,
            total_careers=total_careers,
            total_scholarships=total_scholarships,
            completed_personality_assessments=c_pers,
            completed_riasec_assessments=c_ria,
            generated_recommendations_count=c_recs,
            popular_majors=popular_majors,
            popular_universities=popular_unis,
            registrations_by_month=registrations_by_month,
            assessments_by_month=assessments_by_month,
            recommendations_by_month=recommendations_by_month,
            users_by_role=users_by_role,
        )
    )


@router.get("/users", response_model=ApiResponse[List[UserManagementOut]])
async def list_users(
    q: Optional[str] = Query(None, max_length=100),
    role: Optional[str] = Query(None, max_length=30),
    status_filter: Optional[str] = Query(None, alias="status", max_length=30),
    limit: int = Query(100, ge=1, le=500),
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.roles), selectinload(User.profile))
        .order_by(User.created_at.desc())
        .limit(limit)
    )
    if q:
        needle = f"%{q.strip()}%"
        stmt = stmt.outerjoin(StudentProfile, StudentProfile.user_id == User.id).where(
            or_(
                User.email.ilike(needle),
                StudentProfile.full_name_en.ilike(needle),
                StudentProfile.full_name_km.ilike(needle),
            )
        )
    if role:
        stmt = stmt.where(User.roles.any(Role.name == role))
    if status_filter:
        stmt = stmt.where(User.status == status_filter)

    res = await db.execute(stmt)
    users = res.scalars().all()

    data = [
        UserManagementOut(
            id=u.id,
            email=u.email,
            status=u.status,
            roles=[r.name for r in u.roles],
            full_name_en=u.profile.full_name_en if u.profile else None,
            full_name_km=u.profile.full_name_km if u.profile else None,
            province=u.profile.province if u.profile else None,
            is_email_verified=u.is_email_verified,
            last_login_at=u.last_login_at.isoformat() if u.last_login_at else None,
            created_at=u.created_at.isoformat() if u.created_at else "",
        )
        for u in users
    ]
    return ApiResponse(success=True, data=data)


@router.get("/rules", response_model=ApiResponse[List[RecommendationRuleOut]])
async def list_recommendation_rules(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(RecommendationRule).order_by(RecommendationRule.created_at.desc())
    res = await db.execute(stmt)
    rules = res.scalars().all()

    data = [
        RecommendationRuleOut(
            id=r.id,
            rule_name=r.rule_name,
            weight_personality=float(r.weight_personality),
            weight_riasec=float(r.weight_riasec),
            weight_academic_strengths=float(r.weight_academic_strengths),
            weight_career_alignment=float(r.weight_career_alignment),
            is_active=r.is_active,
            parameters=r.parameters
        )
        for r in rules
    ]
    return ApiResponse(success=True, data=data)


@router.put("/rules/{id}", response_model=ApiResponse[RecommendationRuleOut])
async def update_recommendation_rule(
    id: uuid.UUID,
    body: RuleUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(RecommendationRule).where(RecommendationRule.id == id)
    res = await db.execute(stmt)
    rule = res.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")

    if body.weight_personality is not None:
        rule.weight_personality = body.weight_personality
    if body.weight_riasec is not None:
        rule.weight_riasec = body.weight_riasec
    if body.weight_academic_strengths is not None:
        rule.weight_academic_strengths = body.weight_academic_strengths
    if body.weight_career_alignment is not None:
        rule.weight_career_alignment = body.weight_career_alignment
    if body.is_active is not None:
        rule.is_active = body.is_active
    if body.parameters is not None:
        rule.parameters = body.parameters

    await db.commit()
    await db.refresh(rule)

    return ApiResponse(
        success=True,
        message="Recommendation weights updated successfully",
        data=RecommendationRuleOut(
            id=rule.id,
            rule_name=rule.rule_name,
            weight_personality=float(rule.weight_personality),
            weight_riasec=float(rule.weight_riasec),
            weight_academic_strengths=float(rule.weight_academic_strengths),
            weight_career_alignment=float(rule.weight_career_alignment),
            is_active=rule.is_active,
            parameters=rule.parameters
        )
    )



# =========================================================================
# Helpers shared by the admin management endpoints
# =========================================================================

def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return slug or f"item-{uuid.uuid4().hex[:6]}"


def _pair(en: Optional[str], km: Optional[str]) -> Dict[str, str]:
    return {"en": en or "", "km": km or en or ""}


def _merge_pair(current: Any, en: Optional[str], km: Optional[str]) -> Dict[str, str]:
    pair = current if isinstance(current, dict) else {}
    return {
        "en": en if en is not None else pair.get("en", ""),
        "km": km if km is not None else pair.get("km", pair.get("en", "")),
    }


async def _ensure_slug(db: AsyncSession, model, slug: str, exclude_id=None) -> None:
    stmt = select(model.id).where(model.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(model.id != exclude_id)
    if (await db.execute(stmt)).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That slug is already in use",
        )


async def _audit(
    db: AsyncSession,
    actor: User,
    action: str,
    resource: str,
    before: Optional[Dict[str, Any]] = None,
    after: Optional[Dict[str, Any]] = None,
) -> None:
    db.add(
        AuditLog(
            actor_id=actor.id,
            action=action,
            target_resource=resource,
            payload_before=before,
            payload_after=after,
        )
    )


def _flat_university(u: University) -> Dict[str, Any]:
    name = u.name if isinstance(u.name, dict) else {}
    acronym = u.acronym if isinstance(u.acronym, dict) else {}
    description = u.description if isinstance(u.description, dict) else {}
    return {
        "id": str(u.id),
        "slug": u.slug,
        "name_en": name.get("en", ""),
        "name_km": name.get("km", ""),
        "acronym_en": acronym.get("en", ""),
        "acronym_km": acronym.get("km", ""),
        "description_en": description.get("en", ""),
        "description_km": description.get("km", ""),
        "university_type": u.university_type,
        "province": u.province,
        "website_url": u.website_url,
        "contact_email": u.contact_email,
        "contact_phone": u.contact_phone,
        "logo_url": u.logo_url,
        "cover_image_url": u.cover_image_url,
        "established_year": u.established_year,
        "tuition_range_min_usd": float(u.tuition_range_min_usd) if u.tuition_range_min_usd is not None else None,
        "tuition_range_max_usd": float(u.tuition_range_max_usd) if u.tuition_range_max_usd is not None else None,
        "is_tuition_verified": u.is_tuition_verified,
        "is_verified": u.is_verified,
    }


def _flat_major(m: Major) -> Dict[str, Any]:
    name = m.name if isinstance(m.name, dict) else {}
    description = m.description if isinstance(m.description, dict) else {}
    return {
        "id": str(m.id),
        "slug": m.slug,
        "name_en": name.get("en", ""),
        "name_km": name.get("km", ""),
        "category": m.category,
        "description_en": description.get("en", ""),
        "description_km": description.get("km", ""),
        "riasec_primary": m.riasec_primary,
        "riasec_secondary": m.riasec_secondary,
        "personality_affinity": m.personality_affinity,
        "image_url": m.image_url,
        "is_stem": m.is_stem,
    }


def _flat_career(c: Career) -> Dict[str, Any]:
    title = c.title if isinstance(c.title, dict) else {}
    description = c.description if isinstance(c.description, dict) else {}
    return {
        "id": str(c.id),
        "slug": c.slug,
        "title_en": title.get("en", ""),
        "title_km": title.get("km", ""),
        "industry": c.industry,
        "description_en": description.get("en", ""),
        "description_km": description.get("km", ""),
        "education_level": c.education_level,
        "riasec_code": c.riasec_code,
    }


def _flat_scholarship(s: Scholarship) -> Dict[str, Any]:
    title = s.title if isinstance(s.title, dict) else {}
    provider = s.provider if isinstance(s.provider, dict) else {}
    description = s.description if isinstance(s.description, dict) else {}
    return {
        "id": str(s.id),
        "slug": s.slug,
        "title_en": title.get("en", ""),
        "title_km": title.get("km", ""),
        "provider_en": provider.get("en", ""),
        "provider_km": provider.get("km", ""),
        "description_en": description.get("en", ""),
        "description_km": description.get("km", ""),
        "coverage_type": s.coverage_type,
        "coverage_percentage": s.coverage_percentage,
        "country_or_institution": s.country_or_institution,
        "application_deadline": s.application_deadline.isoformat() if s.application_deadline else None,
        "official_url": s.official_url,
        "source_name": s.source_name,
        "poster_url": s.poster_url,
        "is_verified": s.is_verified,
    }


# =========================================================================
# User management
# =========================================================================

@router.patch("/users/{id}/status", response_model=ApiResponse[Dict[str, Any]])
async def update_user_status(
    id: uuid.UUID,
    body: UserStatusUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if id == admin_user.id:
        raise HTTPException(status_code=400, detail="You cannot suspend your own admin account")

    stmt = select(User).options(selectinload(User.roles)).where(User.id == id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    actor_roles = {r.name for r in admin_user.roles}
    target_roles = {r.name for r in user.roles}
    if "SUPER_ADMIN" in target_roles and "SUPER_ADMIN" not in actor_roles:
        raise HTTPException(status_code=403, detail="Only a super admin can modify a super admin")

    before = {"status": user.status}
    user.status = body.status

    if body.status != "ACTIVE":
        # Force the account out of every active device immediately.
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user.id, RefreshToken.is_revoked == False)
            .values(is_revoked=True, revoked_at=datetime.now(timezone.utc))
        )

    await _audit(db, admin_user, "update_status", "user", before, {"status": user.status})
    await db.commit()
    return ApiResponse(
        success=True,
        message=f"User status updated to {user.status}",
        data={"id": str(user.id), "status": user.status},
    )


@router.patch("/users/{id}/roles", response_model=ApiResponse[Dict[str, Any]])
async def update_user_roles(
    id: uuid.UUID,
    body: UserRolesUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if id == admin_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own roles")

    if not body.roles:
        raise HTTPException(status_code=400, detail="A user must keep at least one role")

    stmt = select(User).options(selectinload(User.roles)).where(User.id == id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    actor_roles = {r.name for r in admin_user.roles}
    target_roles = {r.name for r in user.roles}
    requested = set(body.roles)

    if "SUPER_ADMIN" in requested and "SUPER_ADMIN" not in actor_roles:
        raise HTTPException(status_code=403, detail="Only a super admin can grant SUPER_ADMIN")
    if "SUPER_ADMIN" in target_roles and "SUPER_ADMIN" not in actor_roles:
        raise HTTPException(status_code=403, detail="Only a super admin can modify a super admin")
    if "SUPER_ADMIN" in target_roles and "SUPER_ADMIN" not in requested:
        super_count = (
            await db.execute(
                select(func.count())
                .select_from(User)
                .where(User.roles.any(Role.name == "SUPER_ADMIN"))
            )
        ).scalar() or 0
        if super_count <= 1:
            raise HTTPException(status_code=400, detail="At least one SUPER_ADMIN must remain")

    roles = (
        await db.execute(select(Role).where(Role.name.in_(requested)))
    ).scalars().all()
    if len(roles) != len(requested):
        raise HTTPException(status_code=400, detail="One or more roles do not exist")

    before = {"roles": sorted(target_roles)}
    user.roles = list(roles)
    await _audit(db, admin_user, "update_roles", "user", before, {"roles": sorted(requested)})
    await db.commit()
    return ApiResponse(
        success=True,
        message="User roles updated",
        data={"id": str(user.id), "roles": sorted(requested)},
    )


# =========================================================================
# Universities
# =========================================================================

@router.get("/universities", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_universities(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(University).order_by(University.created_at.desc()))
    return ApiResponse(success=True, data=[_flat_university(u) for u in res.scalars().all()])


@router.post("/universities", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_university(
    body: UniversityAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not body.name_en or not body.acronym_en or not body.university_type or not body.province:
        raise HTTPException(status_code=422, detail="name_en, acronym_en, university_type and province are required")

    slug = body.slug or _slugify(body.name_en)
    await _ensure_slug(db, University, slug)

    university = University(
        slug=slug,
        name=_pair(body.name_en, body.name_km),
        acronym=_pair(body.acronym_en, body.acronym_km),
        description=_pair(body.description_en, body.description_km),
        university_type=body.university_type,
        province=body.province,
        address={"en": "", "km": ""},
        website_url=body.website_url or "",
        contact_email=body.contact_email,
        contact_phone=body.contact_phone,
        logo_url=body.logo_url,
        cover_image_url=body.cover_image_url,
        established_year=body.established_year,
        tuition_range_min_usd=body.tuition_range_min_usd,
        tuition_range_max_usd=body.tuition_range_max_usd,
        is_tuition_verified=bool(body.is_tuition_verified),
        is_verified=body.is_verified if body.is_verified is not None else True,
    )
    db.add(university)
    await db.flush()
    await _audit(db, admin_user, "create", "university", after=_flat_university(university))
    await db.commit()
    await db.refresh(university)
    return ApiResponse(success=True, message="University created", data=_flat_university(university))


@router.patch("/universities/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_university(
    id: uuid.UUID,
    body: UniversityAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    university = (await db.execute(select(University).where(University.id == id))).scalar_one_or_none()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    before = _flat_university(university)
    if body.slug is not None and body.slug != university.slug:
        await _ensure_slug(db, University, body.slug, exclude_id=university.id)
        university.slug = body.slug
    if body.name_en is not None or body.name_km is not None:
        university.name = _merge_pair(university.name, body.name_en, body.name_km)
    if body.acronym_en is not None or body.acronym_km is not None:
        university.acronym = _merge_pair(university.acronym, body.acronym_en, body.acronym_km)
    if body.description_en is not None or body.description_km is not None:
        university.description = _merge_pair(university.description, body.description_en, body.description_km)
    for field in (
        "university_type", "province", "website_url", "contact_email", "contact_phone",
        "logo_url", "cover_image_url", "established_year",
        "tuition_range_min_usd", "tuition_range_max_usd",
        "is_tuition_verified", "is_verified",
    ):
        value = getattr(body, field)
        if value is not None:
            setattr(university, field, value)

    await _audit(db, admin_user, "update", "university", before, _flat_university(university))
    await db.commit()
    await db.refresh(university)
    return ApiResponse(success=True, message="University updated", data=_flat_university(university))


@router.delete("/universities/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_university(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    university = (await db.execute(select(University).where(University.id == id))).scalar_one_or_none()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    before = _flat_university(university)
    try:
        await db.delete(university)
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete: this university is referenced by saved or linked records")
    await _audit(db, admin_user, "delete", "university", before)
    await db.commit()
    return ApiResponse(success=True, message="University deleted", data={"id": str(id)})


# =========================================================================
# Majors
# =========================================================================

@router.get("/majors", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_majors(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Major).order_by(Major.created_at.desc()))
    return ApiResponse(success=True, data=[_flat_major(m) for m in res.scalars().all()])


@router.post("/majors", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_major(
    body: MajorAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not body.name_en or not body.category or not body.riasec_primary or not body.riasec_secondary:
        raise HTTPException(status_code=422, detail="name_en, category and both RIASEC codes are required")

    slug = body.slug or _slugify(body.name_en)
    await _ensure_slug(db, Major, slug)

    major = Major(
        slug=slug,
        name=_pair(body.name_en, body.name_km),
        category=body.category,
        description=_pair(body.description_en, body.description_km),
        subjects_studied=[],
        required_skills=[],
        potential_challenges=[],
        riasec_primary=body.riasec_primary.upper(),
        riasec_secondary=body.riasec_secondary.upper(),
        personality_affinity=body.personality_affinity,
        image_url=body.image_url,
        is_stem=bool(body.is_stem),
    )
    db.add(major)
    await db.flush()
    await _audit(db, admin_user, "create", "major", after=_flat_major(major))
    await db.commit()
    await db.refresh(major)
    return ApiResponse(success=True, message="Major created", data=_flat_major(major))


@router.patch("/majors/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_major(
    id: uuid.UUID,
    body: MajorAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    major = (await db.execute(select(Major).where(Major.id == id))).scalar_one_or_none()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")

    before = _flat_major(major)
    if body.slug is not None and body.slug != major.slug:
        await _ensure_slug(db, Major, body.slug, exclude_id=major.id)
        major.slug = body.slug
    if body.name_en is not None or body.name_km is not None:
        major.name = _merge_pair(major.name, body.name_en, body.name_km)
    if body.description_en is not None or body.description_km is not None:
        major.description = _merge_pair(major.description, body.description_en, body.description_km)
    for field in ("category", "personality_affinity", "image_url", "is_stem"):
        value = getattr(body, field)
        if value is not None:
            setattr(major, field, value)
    if body.riasec_primary is not None:
        major.riasec_primary = body.riasec_primary.upper()
    if body.riasec_secondary is not None:
        major.riasec_secondary = body.riasec_secondary.upper()

    await _audit(db, admin_user, "update", "major", before, _flat_major(major))
    await db.commit()
    await db.refresh(major)
    return ApiResponse(success=True, message="Major updated", data=_flat_major(major))


@router.delete("/majors/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_major(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    major = (await db.execute(select(Major).where(Major.id == id))).scalar_one_or_none()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    before = _flat_major(major)
    try:
        await db.delete(major)
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete: this major is referenced by saved or linked records")
    await _audit(db, admin_user, "delete", "major", before)
    await db.commit()
    return ApiResponse(success=True, message="Major deleted", data={"id": str(id)})


# =========================================================================
# Careers
# =========================================================================

@router.get("/careers", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_careers(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Career).order_by(Career.created_at.desc()))
    return ApiResponse(success=True, data=[_flat_career(c) for c in res.scalars().all()])


@router.post("/careers", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_career(
    body: CareerAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not body.title_en or not body.industry or not body.education_level or not body.riasec_code:
        raise HTTPException(status_code=422, detail="title_en, industry, education_level and riasec_code are required")

    slug = body.slug or _slugify(body.title_en)
    await _ensure_slug(db, Career, slug)

    career = Career(
        slug=slug,
        title=_pair(body.title_en, body.title_km),
        industry=body.industry,
        description=_pair(body.description_en, body.description_km),
        responsibilities=[],
        required_skills=[],
        education_level=body.education_level,
        work_environments=[],
        career_progression=[],
        riasec_code=body.riasec_code.upper(),
    )
    db.add(career)
    await db.flush()
    await _audit(db, admin_user, "create", "career", after=_flat_career(career))
    await db.commit()
    await db.refresh(career)
    return ApiResponse(success=True, message="Career created", data=_flat_career(career))


@router.patch("/careers/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_career(
    id: uuid.UUID,
    body: CareerAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    career = (await db.execute(select(Career).where(Career.id == id))).scalar_one_or_none()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    before = _flat_career(career)
    if body.slug is not None and body.slug != career.slug:
        await _ensure_slug(db, Career, body.slug, exclude_id=career.id)
        career.slug = body.slug
    if body.title_en is not None or body.title_km is not None:
        career.title = _merge_pair(career.title, body.title_en, body.title_km)
    if body.description_en is not None or body.description_km is not None:
        career.description = _merge_pair(career.description, body.description_en, body.description_km)
    for field in ("industry", "education_level"):
        value = getattr(body, field)
        if value is not None:
            setattr(career, field, value)
    if body.riasec_code is not None:
        career.riasec_code = body.riasec_code.upper()

    await _audit(db, admin_user, "update", "career", before, _flat_career(career))
    await db.commit()
    await db.refresh(career)
    return ApiResponse(success=True, message="Career updated", data=_flat_career(career))


@router.delete("/careers/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_career(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    career = (await db.execute(select(Career).where(Career.id == id))).scalar_one_or_none()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    before = _flat_career(career)
    try:
        await db.delete(career)
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete: this career is referenced by saved or linked records")
    await _audit(db, admin_user, "delete", "career", before)
    await db.commit()
    return ApiResponse(success=True, message="Career deleted", data={"id": str(id)})


# =========================================================================
# Scholarships
# =========================================================================

@router.get("/scholarships", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_scholarships(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Scholarship).order_by(Scholarship.created_at.desc()))
    return ApiResponse(success=True, data=[_flat_scholarship(s) for s in res.scalars().all()])


@router.post("/scholarships", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_scholarship(
    body: ScholarshipAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not body.title_en or not body.provider_en or not body.coverage_type or not body.country_or_institution or not body.official_url:
        raise HTTPException(
            status_code=422,
            detail="title_en, provider_en, coverage_type, country_or_institution and official_url are required",
        )

    slug = body.slug or _slugify(body.title_en)
    await _ensure_slug(db, Scholarship, slug)

    scholarship = Scholarship(
        slug=slug,
        title=_pair(body.title_en, body.title_km),
        provider=_pair(body.provider_en, body.provider_km),
        description=_pair(body.description_en, body.description_km),
        eligibility_criteria={"en": [], "km": []},
        application_process={"en": [], "km": []},
        coverage_type=body.coverage_type,
        coverage_percentage=body.coverage_percentage,
        country_or_institution=body.country_or_institution,
        application_deadline=body.application_deadline,
        official_url=body.official_url,
        source_name=body.source_name,
        poster_url=body.poster_url,
        is_verified=body.is_verified if body.is_verified is not None else True,
    )
    db.add(scholarship)
    await db.flush()
    await _audit(db, admin_user, "create", "scholarship", after=_flat_scholarship(scholarship))
    await db.commit()
    await db.refresh(scholarship)
    return ApiResponse(success=True, message="Scholarship created", data=_flat_scholarship(scholarship))


@router.patch("/scholarships/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_scholarship(
    id: uuid.UUID,
    body: ScholarshipAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    scholarship = (await db.execute(select(Scholarship).where(Scholarship.id == id))).scalar_one_or_none()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    before = _flat_scholarship(scholarship)
    if body.slug is not None and body.slug != scholarship.slug:
        await _ensure_slug(db, Scholarship, body.slug, exclude_id=scholarship.id)
        scholarship.slug = body.slug
    if body.title_en is not None or body.title_km is not None:
        scholarship.title = _merge_pair(scholarship.title, body.title_en, body.title_km)
    if body.provider_en is not None or body.provider_km is not None:
        scholarship.provider = _merge_pair(scholarship.provider, body.provider_en, body.provider_km)
    if body.description_en is not None or body.description_km is not None:
        scholarship.description = _merge_pair(scholarship.description, body.description_en, body.description_km)
    for field in (
        "coverage_type", "coverage_percentage", "country_or_institution",
        "application_deadline", "official_url", "source_name", "poster_url", "is_verified",
    ):
        value = getattr(body, field)
        if value is not None:
            setattr(scholarship, field, value)

    await _audit(db, admin_user, "update", "scholarship", before, _flat_scholarship(scholarship))
    await db.commit()
    await db.refresh(scholarship)
    return ApiResponse(success=True, message="Scholarship updated", data=_flat_scholarship(scholarship))


@router.delete("/scholarships/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_scholarship(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    scholarship = (await db.execute(select(Scholarship).where(Scholarship.id == id))).scalar_one_or_none()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    before = _flat_scholarship(scholarship)
    try:
        await db.delete(scholarship)
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete: this scholarship is referenced by saved records")
    await _audit(db, admin_user, "delete", "scholarship", before)
    await db.commit()
    return ApiResponse(success=True, message="Scholarship deleted", data={"id": str(id)})


# =========================================================================
# Audit log
# =========================================================================

@router.get("/audit-logs", response_model=ApiResponse[List[Dict[str, Any]]])
async def list_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    logs = (
        await db.execute(
            select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
        )
    ).scalars().all()

    actor_ids = {log.actor_id for log in logs if log.actor_id}
    emails: Dict[uuid.UUID, str] = {}
    if actor_ids:
        rows = await db.execute(select(User.id, User.email).where(User.id.in_(actor_ids)))
        emails = {row[0]: row[1] for row in rows.fetchall()}

    return ApiResponse(
        success=True,
        data=[
            {
                "id": str(log.id),
                "actor_id": str(log.actor_id) if log.actor_id else None,
                "actor_email": emails.get(log.actor_id),
                "action": log.action,
                "target_resource": log.target_resource,
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "payload_before": log.payload_before,
                "payload_after": log.payload_after,
            }
            for log in logs
        ],
    )
