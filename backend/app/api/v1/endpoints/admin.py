import re
import uuid
from datetime import date, datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.core.security import hash_password
from app.models.auth import AuditLog, RefreshToken, User, Role
from app.models.profile import StudentProfile
from app.models.catalog import University, Major, Career, Faculty, UniversityMajor
from app.models.scholarship import Scholarship
from app.models.assessment import (
    PersonalityAssessment,
    PersonalityAnswer,
    PersonalityOption,
    PersonalityQuestion,
    RiasecAnswer,
    RiasecAssessment,
    RiasecQuestion,
)
from app.models.recommendation import MajorRecommendation, RecommendationRule
from app.schemas.admin import (
    AdminAnalyticsOut,
    CareerAdminIn,
    MajorAdminIn,
    PersonalityQuestionAdminIn,
    PersonalityQuestionUpdateIn,
    RiasecQuestionAdminIn,
    RiasecQuestionUpdateIn,
    RuleUpdateIn,
    AdmissionCoverageImportIn,
    ScholarshipAdminIn,
    UniversityAdminIn,
    UniversityOfferingCreateIn,
    UniversityOfferingUpdateIn,
    UserAdminCreateIn,
    UserAdminUpdateIn,
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

    data = [_user_out(u) for u in users]
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


def _user_out(user: User) -> UserManagementOut:
    profile = user.profile
    return UserManagementOut(
        id=user.id,
        email=user.email,
        status=user.status,
        roles=sorted(r.name for r in user.roles),
        full_name_en=profile.full_name_en if profile else None,
        full_name_km=profile.full_name_km if profile else None,
        province=profile.province if profile else None,
        avatar_url=profile.avatar_url if profile else None,
        is_email_verified=user.is_email_verified,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )


async def _resolve_roles(
    db: AsyncSession,
    requested: List[str],
    actor: User,
) -> List[Role]:
    names = list(dict.fromkeys(requested))
    if not names:
        raise HTTPException(status_code=400, detail="A user must have at least one role")
    actor_roles = {r.name for r in actor.roles}
    if "SUPER_ADMIN" in names and "SUPER_ADMIN" not in actor_roles:
        raise HTTPException(status_code=403, detail="Only a super admin can grant SUPER_ADMIN")
    roles = (
        await db.execute(select(Role).where(Role.name.in_(names)))
    ).scalars().all()
    if len(roles) != len(names):
        raise HTTPException(status_code=400, detail="One or more roles do not exist")
    return list(roles)


async def _revoke_user_sessions(db: AsyncSession, user_id: uuid.UUID) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False)
        .values(is_revoked=True, revoked_at=datetime.now(timezone.utc))
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


def _flat_offering(offering: UniversityMajor) -> Dict[str, Any]:
    university_name = (
        offering.university.name if isinstance(offering.university.name, dict) else {}
    )
    major_name = (
        offering.major.name if isinstance(offering.major.name, dict) else {}
    )
    return {
        "id": str(offering.id),
        "university_id": str(offering.university_id),
        "university_slug": offering.university.slug,
        "university_name_en": university_name.get("en", ""),
        "university_name_km": university_name.get("km", ""),
        "major_id": str(offering.major_id),
        "major_slug": offering.major.slug,
        "major_name_en": major_name.get("en", ""),
        "major_name_km": major_name.get("km", ""),
        "faculty_id": str(offering.faculty_id) if offering.faculty_id else None,
        "degree_level": offering.degree_level,
        "duration_years": float(offering.duration_years)
        if offering.duration_years is not None
        else None,
        "tuition_annual_usd": float(offering.tuition_annual_usd)
        if offering.tuition_annual_usd is not None
        else None,
        "is_tuition_verified": offering.is_tuition_verified,
        "language_of_instruction": offering.language_of_instruction,
        "official_curriculum_url": offering.official_curriculum_url,
        "min_bacii_grade": offering.min_bacii_grade,
        "required_subjects": offering.required_subjects,
        "is_admission_verified": offering.is_admission_verified,
        "admission_source_url": offering.admission_source_url,
        "admission_notes": (
            offering.admission_criteria.get("notes")
            if isinstance(offering.admission_criteria, dict)
            else None
        ),
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

@router.post("/users", response_model=ApiResponse[UserManagementOut])
async def create_user(
    body: UserAdminCreateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    email = str(body.email).strip().lower()
    existing = (
        await db.execute(select(User).where(func.lower(User.email) == email))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    roles = await _resolve_roles(db, body.roles, admin_user)
    user = User(
        email=email,
        password_hash=hash_password(body.password),
        status=body.status,
        is_email_verified=body.is_email_verified,
        roles=roles,
    )
    profile = StudentProfile(
        full_name_en=body.full_name_en.strip(),
        full_name_km=(body.full_name_km or body.full_name_en).strip(),
        province=body.province.strip() or "Phnom Penh",
        current_education_level=body.current_education_level,
        preferred_language=body.preferred_language,
        avatar_url=body.avatar_url,
    )
    user.profile = profile
    db.add(user)
    await db.flush()

    await _audit(
        db,
        admin_user,
        "create",
        "user",
        None,
        {
            "id": str(user.id),
            "email": user.email,
            "status": user.status,
            "roles": sorted(r.name for r in roles),
        },
    )
    await db.commit()
    return ApiResponse(
        success=True,
        message="User created",
        data=_user_out(user),
    )


@router.patch("/users/{id}", response_model=ApiResponse[UserManagementOut])
async def update_user(
    id: uuid.UUID,
    body: UserAdminUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(User)
        .options(selectinload(User.roles), selectinload(User.profile))
        .where(User.id == id)
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    actor_roles = {r.name for r in admin_user.roles}
    target_roles = {r.name for r in user.roles}
    if "SUPER_ADMIN" in target_roles and "SUPER_ADMIN" not in actor_roles:
        raise HTTPException(status_code=403, detail="Only a super admin can modify a super admin")

    profile = user.profile
    before = {
        "email": user.email,
        "status": user.status,
        "roles": sorted(target_roles),
        "full_name_en": profile.full_name_en if profile else None,
        "full_name_km": profile.full_name_km if profile else None,
        "province": profile.province if profile else None,
        "avatar_url": profile.avatar_url if profile else None,
    }

    if body.email is not None:
        email = str(body.email).strip().lower()
        if email != user.email:
            existing = (
                await db.execute(
                    select(User).where(
                        func.lower(User.email) == email,
                        User.id != user.id,
                    )
                )
            ).scalar_one_or_none()
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
            user.email = email

    if body.password:
        user.password_hash = hash_password(body.password)
        await _revoke_user_sessions(db, user.id)

    if body.status is not None and body.status != user.status:
        if user.id == admin_user.id:
            raise HTTPException(status_code=400, detail="You cannot change your own status")
        user.status = body.status
        if body.status != "ACTIVE":
            await _revoke_user_sessions(db, user.id)

    if body.roles is not None:
        requested = set(body.roles)
        if not requested:
            raise HTTPException(status_code=400, detail="A user must keep at least one role")
        if user.id == admin_user.id and requested != target_roles:
            raise HTTPException(status_code=400, detail="You cannot change your own roles")
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
        user.roles = await _resolve_roles(db, list(requested), admin_user)

    if profile is None and (
        body.full_name_en is not None
        or body.full_name_km is not None
        or body.province is not None
        or body.current_education_level is not None
        or body.preferred_language is not None
        or "avatar_url" in body.model_fields_set
    ):
        profile = StudentProfile(
            user=user,
            full_name_en=body.full_name_en or user.email.split("@")[0],
            full_name_km=body.full_name_km,
            province=body.province or "Phnom Penh",
            current_education_level=body.current_education_level or "GRADE_12",
            preferred_language=body.preferred_language or "km",
            avatar_url=body.avatar_url or None,
        )
        user.profile = profile

    if profile is not None:
        if body.full_name_en is not None:
            profile.full_name_en = body.full_name_en.strip()
        if body.full_name_km is not None:
            profile.full_name_km = body.full_name_km.strip()
        if body.province is not None:
            profile.province = body.province.strip() or "Phnom Penh"
        if body.current_education_level is not None:
            profile.current_education_level = body.current_education_level
        if body.preferred_language is not None:
            profile.preferred_language = body.preferred_language
        if "avatar_url" in body.model_fields_set:
            profile.avatar_url = body.avatar_url or None

    if body.is_email_verified is not None:
        user.is_email_verified = body.is_email_verified

    await _audit(
        db,
        admin_user,
        "update",
        "user",
        before,
        {
            "email": user.email,
            "status": user.status,
            "roles": sorted(r.name for r in user.roles),
            "full_name_en": profile.full_name_en if profile else None,
            "full_name_km": profile.full_name_km if profile else None,
            "province": profile.province if profile else None,
        },
    )
    await db.commit()
    return ApiResponse(
        success=True,
        message="User updated",
        data=_user_out(user),
    )


@router.delete("/users/{id}", response_model=ApiResponse[Dict[str, Any]])
async def delete_user(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if id == admin_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    stmt = (
        select(User)
        .options(selectinload(User.roles), selectinload(User.profile))
        .where(User.id == id)
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    actor_roles = {r.name for r in admin_user.roles}
    target_roles = {r.name for r in user.roles}
    if "SUPER_ADMIN" in target_roles and "SUPER_ADMIN" not in actor_roles:
        raise HTTPException(status_code=403, detail="Only a super admin can delete a super admin")
    if "SUPER_ADMIN" in target_roles:
        super_count = (
            await db.execute(
                select(func.count())
                .select_from(User)
                .where(User.roles.any(Role.name == "SUPER_ADMIN"))
            )
        ).scalar() or 0
        if super_count <= 1:
            raise HTTPException(status_code=400, detail="At least one SUPER_ADMIN must remain")

    await _audit(
        db,
        admin_user,
        "delete",
        "user",
        {
            "id": str(user.id),
            "email": user.email,
            "status": user.status,
            "roles": sorted(target_roles),
        },
        None,
    )
    await db.delete(user)
    await db.commit()
    return ApiResponse(
        success=True,
        message="User deleted",
        data={"id": str(id)},
    )


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
# University Offerings (which majors a university teaches)
# =========================================================================

@router.get("/offerings", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_offerings(
    university_id: Optional[uuid.UUID] = Query(None),
    major_id: Optional[uuid.UUID] = Query(None),
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(UniversityMajor)
        .options(
            selectinload(UniversityMajor.university),
            selectinload(UniversityMajor.major),
        )
        .order_by(UniversityMajor.created_at.desc())
    )
    if university_id:
        stmt = stmt.where(UniversityMajor.university_id == university_id)
    if major_id:
        stmt = stmt.where(UniversityMajor.major_id == major_id)
    rows = (await db.execute(stmt)).scalars().all()
    return ApiResponse(success=True, data=[_flat_offering(row) for row in rows])


async def _load_offering_dependencies(
    db: AsyncSession,
    university_id: uuid.UUID,
    major_id: uuid.UUID,
    faculty_id: Optional[uuid.UUID],
) -> tuple[University, Major, Optional[Faculty]]:
    university = (
        await db.execute(select(University).where(University.id == university_id))
    ).scalar_one_or_none()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    major = (
        await db.execute(select(Major).where(Major.id == major_id))
    ).scalar_one_or_none()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    faculty = None
    if faculty_id:
        faculty = (
            await db.execute(
                select(Faculty).where(
                    Faculty.id == faculty_id,
                    Faculty.university_id == university_id,
                )
            )
        ).scalar_one_or_none()
        if not faculty:
            raise HTTPException(
                status_code=422,
                detail="Faculty does not belong to the selected university",
            )
    return university, major, faculty


async def _ensure_unique_offering(
    db: AsyncSession,
    university_id: uuid.UUID,
    major_id: uuid.UUID,
    degree_level: str,
    language: str,
    exclude_id: Optional[uuid.UUID] = None,
):
    stmt = select(UniversityMajor).where(
        UniversityMajor.university_id == university_id,
        UniversityMajor.major_id == major_id,
        UniversityMajor.degree_level == degree_level,
        UniversityMajor.language_of_instruction == language,
    )
    if exclude_id:
        stmt = stmt.where(UniversityMajor.id != exclude_id)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This university already offers that major at the same degree level and language",
        )


@router.post("/offerings", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_offering(
    body: UniversityOfferingCreateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    university, major, faculty = await _load_offering_dependencies(
        db, body.university_id, body.major_id, body.faculty_id
    )
    if body.min_bacii_grade == "F" and body.degree_level != "ASSOCIATE":
        raise HTTPException(
            status_code=400,
            detail="Grade F is only accepted for associate/diploma programs",
        )
    await _ensure_unique_offering(
        db,
        body.university_id,
        body.major_id,
        body.degree_level,
        body.language_of_instruction,
    )
    offering = UniversityMajor(
        university_id=body.university_id,
        major_id=body.major_id,
        faculty_id=faculty.id if faculty else None,
        degree_level=body.degree_level,
        duration_years=body.duration_years,
        tuition_annual_usd=body.tuition_annual_usd,
        is_tuition_verified=body.is_tuition_verified,
        language_of_instruction=body.language_of_instruction,
        official_curriculum_url=body.official_curriculum_url,
        min_bacii_grade=body.min_bacii_grade,
        required_subjects=body.required_subjects,
        is_admission_verified=body.is_admission_verified,
        admission_source_url=body.admission_source_url,
        admission_criteria=(
            {"notes": body.admission_notes.strip()}
            if body.admission_notes and body.admission_notes.strip()
            else None
        ),
    )
    offering.university = university
    offering.major = major
    db.add(offering)
    await db.flush()
    await _audit(db, admin_user, "create", "university_offering", after=_flat_offering(offering))
    await db.commit()
    return ApiResponse(success=True, message="Program added to university", data=_flat_offering(offering))


@router.patch("/offerings/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_offering(
    id: uuid.UUID,
    body: UniversityOfferingUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    offering = (
        await db.execute(
            select(UniversityMajor)
            .options(
                selectinload(UniversityMajor.university),
                selectinload(UniversityMajor.major),
            )
            .where(UniversityMajor.id == id)
        )
    ).scalar_one_or_none()
    if not offering:
        raise HTTPException(status_code=404, detail="University offering not found")

    before = _flat_offering(offering)
    university_id = body.university_id or offering.university_id
    major_id = body.major_id or offering.major_id
    faculty_id = body.faculty_id if body.faculty_id is not None else offering.faculty_id
    degree_level = body.degree_level or offering.degree_level
    language = body.language_of_instruction or offering.language_of_instruction

    next_bacii_grade = (
        body.min_bacii_grade
        if "min_bacii_grade" in body.model_fields_set
        else offering.min_bacii_grade
    )
    if next_bacii_grade == "F" and degree_level != "ASSOCIATE":
        raise HTTPException(
            status_code=400,
            detail="Grade F is only accepted for associate/diploma programs",
        )

    if body.university_id or body.major_id or body.faculty_id is not None:
        university, major, faculty = await _load_offering_dependencies(
            db, university_id, major_id, faculty_id
        )
        offering.university = university
        offering.major = major
        offering.university_id = university.id
        offering.major_id = major.id
        offering.faculty_id = faculty.id if faculty else None

    if body.degree_level or body.language_of_instruction or body.university_id or body.major_id:
        await _ensure_unique_offering(
            db, university_id, major_id, degree_level, language, exclude_id=offering.id
        )

    for field in (
        "degree_level",
        "duration_years",
        "tuition_annual_usd",
        "is_tuition_verified",
        "language_of_instruction",
        "official_curriculum_url",
        "is_admission_verified",
    ):
        value = getattr(body, field)
        if value is not None:
            setattr(offering, field, value)

    for field in ("min_bacii_grade", "required_subjects", "admission_source_url"):
        if field in body.model_fields_set:
            setattr(offering, field, getattr(body, field))

    if "admission_notes" in body.model_fields_set:
        notes = (body.admission_notes or "").strip()
        criteria = (
            offering.admission_criteria
            if isinstance(offering.admission_criteria, dict)
            else {}
        )
        criteria = dict(criteria)
        if notes:
            criteria["notes"] = notes
        else:
            criteria.pop("notes", None)
        offering.admission_criteria = criteria or None

    if body.model_fields_set & {
        "min_bacii_grade",
        "required_subjects",
        "admission_source_url",
        "is_admission_verified",
        "admission_notes",
    }:
        criteria = (
            offering.admission_criteria
            if isinstance(offering.admission_criteria, dict)
            else {}
        )
        criteria = dict(criteria)
        criteria["checked_at"] = date.today().isoformat()
        offering.admission_criteria = criteria

    await _audit(db, admin_user, "update", "university_offering", before, _flat_offering(offering))
    await db.commit()
    return ApiResponse(success=True, message="Program updated", data=_flat_offering(offering))


@router.delete("/offerings/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_offering(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    offering = (
        await db.execute(
            select(UniversityMajor)
            .options(
                selectinload(UniversityMajor.university),
                selectinload(UniversityMajor.major),
            )
            .where(UniversityMajor.id == id)
        )
    ).scalar_one_or_none()
    if not offering:
        raise HTTPException(status_code=404, detail="University offering not found")
    before = _flat_offering(offering)
    await db.delete(offering)
    await db.flush()
    await _audit(db, admin_user, "delete", "university_offering", before)
    await db.commit()
    return ApiResponse(success=True, message="Program removed from university", data={"id": str(id)})


# =========================================================================
# Assessment Questions
# =========================================================================

def _flat_personality_question(question: PersonalityQuestion) -> Dict[str, Any]:
    return {
        "id": str(question.id),
        "dimension": question.dimension,
        "prompt_en": question.prompt_en,
        "prompt_km": question.prompt_km,
        "order_index": question.order_index,
        "is_active": question.is_active,
        "options": [
            {
                "id": str(option.id),
                "label_en": option.label_en,
                "label_km": option.label_km,
                "target_trait": option.target_trait,
                "weight": float(option.weight),
                "order_index": option.order_index,
            }
            for option in sorted(question.options, key=lambda item: item.order_index)
        ],
    }


def _flat_riasec_question(question: RiasecQuestion) -> Dict[str, Any]:
    return {
        "id": str(question.id),
        "category": question.category,
        "prompt_en": question.prompt_en,
        "prompt_km": question.prompt_km,
        "order_index": question.order_index,
        "is_active": question.is_active,
    }


def _validate_personality_options(dimension: str, options: List[Any]) -> None:
    expected = {"EI": {"E", "I"}, "SN": {"S", "N"}, "TF": {"T", "F"}, "JP": {"J", "P"}}[dimension]
    if not expected.issubset({option.target_trait for option in options}):
        raise HTTPException(
            status_code=422,
            detail=f"Options for {dimension} must cover {', '.join(sorted(expected))}",
        )


@router.get("/questions/personality", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_personality_questions(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PersonalityQuestion)
        .options(selectinload(PersonalityQuestion.options))
        .order_by(PersonalityQuestion.order_index.asc())
    )
    questions = (await db.execute(stmt)).scalars().all()
    return ApiResponse(success=True, data=[_flat_personality_question(q) for q in questions])


@router.post("/questions/personality", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_personality_question(
    body: PersonalityQuestionAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not body.prompt_en.strip() or not body.prompt_km.strip():
        raise HTTPException(status_code=422, detail="Both English and Khmer prompts are required")
    _validate_personality_options(body.dimension, body.options)

    next_order = body.order_index
    if next_order is None:
        next_order = int(
            (await db.execute(select(func.max(PersonalityQuestion.order_index)))).scalar() or 0
        ) + 1

    question = PersonalityQuestion(
        dimension=body.dimension,
        prompt_en=body.prompt_en.strip(),
        prompt_km=body.prompt_km.strip(),
        order_index=next_order,
        is_active=body.is_active,
    )
    question.options = [
        PersonalityOption(
            label_en=option.label_en.strip(),
            label_km=option.label_km.strip(),
            target_trait=option.target_trait,
            weight=option.weight,
            order_index=option.order_index,
        )
        for option in body.options
    ]
    db.add(question)
    await db.flush()
    await _audit(db, admin_user, "create", "personality_question", after=_flat_personality_question(question))
    await db.commit()
    return ApiResponse(success=True, message="Personality question created", data=_flat_personality_question(question))


@router.patch("/questions/personality/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_personality_question(
    id: uuid.UUID,
    body: PersonalityQuestionUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    question = (
        await db.execute(
            select(PersonalityQuestion)
            .options(selectinload(PersonalityQuestion.options))
            .where(PersonalityQuestion.id == id)
        )
    ).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Personality question not found")

    before = _flat_personality_question(question)
    effective_dimension = body.dimension or question.dimension

    if body.options is not None:
        answer_count = int(
            (
                await db.execute(
                    select(func.count(PersonalityAnswer.id)).where(
                        PersonalityAnswer.question_id == question.id
                    )
                )
            ).scalar()
            or 0
        )
        existing = {option.id: option for option in question.options}
        submitted_ids = {option.id for option in body.options if option.id is not None}
        removes_existing = any(option.id not in submitted_ids for option in question.options)
        adds_new = any(option.id is None for option in body.options)
        if answer_count and (removes_existing or adds_new):
            raise HTTPException(
                status_code=409,
                detail="This question already has student answers. Keep the existing options or deactivate it and create a new question.",
            )

        _validate_personality_options(effective_dimension, body.options)
        for option in body.options:
            if option.id and option.id in existing:
                current = existing[option.id]
                current.label_en = option.label_en.strip()
                current.label_km = option.label_km.strip()
                current.target_trait = option.target_trait
                current.weight = option.weight
                current.order_index = option.order_index
            else:
                question.options.append(
                    PersonalityOption(
                        label_en=option.label_en.strip(),
                        label_km=option.label_km.strip(),
                        target_trait=option.target_trait,
                        weight=option.weight,
                        order_index=option.order_index,
                    )
                )
        for current in question.options:
            if current.id is not None and current.id not in submitted_ids:
                await db.delete(current)
    elif body.dimension and body.dimension != question.dimension:
        _validate_personality_options(body.dimension, question.options)

    if body.dimension is not None:
        question.dimension = body.dimension
    if body.prompt_en is not None:
        if not body.prompt_en.strip():
            raise HTTPException(status_code=422, detail="English prompt cannot be empty")
        question.prompt_en = body.prompt_en.strip()
    if body.prompt_km is not None:
        if not body.prompt_km.strip():
            raise HTTPException(status_code=422, detail="Khmer prompt cannot be empty")
        question.prompt_km = body.prompt_km.strip()
    if body.order_index is not None:
        question.order_index = body.order_index
    if body.is_active is not None:
        question.is_active = body.is_active

    await _audit(db, admin_user, "update", "personality_question", before, _flat_personality_question(question))
    await db.commit()
    return ApiResponse(success=True, message="Personality question updated", data=_flat_personality_question(question))


@router.delete("/questions/personality/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_personality_question(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    question = (
        await db.execute(
            select(PersonalityQuestion)
            .options(selectinload(PersonalityQuestion.options))
            .where(PersonalityQuestion.id == id)
        )
    ).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Personality question not found")
    answer_count = int(
        (
            await db.execute(
                select(func.count(PersonalityAnswer.id)).where(
                    PersonalityAnswer.question_id == question.id
                )
            )
        ).scalar()
        or 0
    )
    if answer_count:
        raise HTTPException(
            status_code=409,
            detail="This question already has student answers. Deactivate it instead of deleting it.",
        )
    before = _flat_personality_question(question)
    await db.delete(question)
    await db.flush()
    await _audit(db, admin_user, "delete", "personality_question", before)
    await db.commit()
    return ApiResponse(success=True, message="Personality question deleted", data={"id": str(id)})


@router.get("/questions/riasec", response_model=ApiResponse[List[Dict[str, Any]]])
async def admin_list_riasec_questions(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(RiasecQuestion).order_by(RiasecQuestion.order_index.asc())
    questions = (await db.execute(stmt)).scalars().all()
    return ApiResponse(success=True, data=[_flat_riasec_question(q) for q in questions])


@router.post("/questions/riasec", response_model=ApiResponse[Dict[str, Any]])
async def admin_create_riasec_question(
    body: RiasecQuestionAdminIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not body.prompt_en.strip() or not body.prompt_km.strip():
        raise HTTPException(status_code=422, detail="Both English and Khmer prompts are required")
    next_order = body.order_index
    if next_order is None:
        next_order = int(
            (await db.execute(select(func.max(RiasecQuestion.order_index)))).scalar() or 0
        ) + 1
    question = RiasecQuestion(
        category=body.category,
        prompt_en=body.prompt_en.strip(),
        prompt_km=body.prompt_km.strip(),
        order_index=next_order,
        is_active=body.is_active,
    )
    db.add(question)
    await db.flush()
    await _audit(db, admin_user, "create", "riasec_question", after=_flat_riasec_question(question))
    await db.commit()
    return ApiResponse(success=True, message="RIASEC question created", data=_flat_riasec_question(question))


@router.patch("/questions/riasec/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_update_riasec_question(
    id: uuid.UUID,
    body: RiasecQuestionUpdateIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    question = (
        await db.execute(select(RiasecQuestion).where(RiasecQuestion.id == id))
    ).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="RIASEC question not found")
    before = _flat_riasec_question(question)
    if body.category is not None:
        question.category = body.category
    if body.prompt_en is not None:
        if not body.prompt_en.strip():
            raise HTTPException(status_code=422, detail="English prompt cannot be empty")
        question.prompt_en = body.prompt_en.strip()
    if body.prompt_km is not None:
        if not body.prompt_km.strip():
            raise HTTPException(status_code=422, detail="Khmer prompt cannot be empty")
        question.prompt_km = body.prompt_km.strip()
    if body.order_index is not None:
        question.order_index = body.order_index
    if body.is_active is not None:
        question.is_active = body.is_active
    await _audit(db, admin_user, "update", "riasec_question", before, _flat_riasec_question(question))
    await db.commit()
    return ApiResponse(success=True, message="RIASEC question updated", data=_flat_riasec_question(question))


@router.delete("/questions/riasec/{id}", response_model=ApiResponse[Dict[str, Any]])
async def admin_delete_riasec_question(
    id: uuid.UUID,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    question = (
        await db.execute(select(RiasecQuestion).where(RiasecQuestion.id == id))
    ).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="RIASEC question not found")
    answer_count = int(
        (
            await db.execute(
                select(func.count(RiasecAnswer.id)).where(
                    RiasecAnswer.question_id == question.id
                )
            )
        ).scalar()
        or 0
    )
    if answer_count:
        raise HTTPException(
            status_code=409,
            detail="This question already has student answers. Deactivate it instead of deleting it.",
        )
    before = _flat_riasec_question(question)
    await db.delete(question)
    await db.flush()
    await _audit(db, admin_user, "delete", "riasec_question", before)
    await db.commit()
    return ApiResponse(success=True, message="RIASEC question deleted", data={"id": str(id)})


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


# =========================================================================
# Admission data coverage
# =========================================================================

@router.get("/admission-coverage", response_model=ApiResponse[Dict[str, Any]])
async def get_admission_coverage(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(UniversityMajor)
            .options(
                selectinload(UniversityMajor.university),
                selectinload(UniversityMajor.major),
            )
            .where(UniversityMajor.degree_level.in_(["BACHELOR", "ASSOCIATE"]))
            .order_by(UniversityMajor.created_at.asc())
        )
    ).scalars().all()

    programs: List[Dict[str, Any]] = []
    institutions: Dict[str, Dict[str, Any]] = {}
    verified_count = 0
    missing_count = 0
    unverified_count = 0
    missing_source_count = 0
    last_checked_any: Optional[str] = None

    for offering in rows:
        university = offering.university
        major = offering.major
        university_name = (
            university.name if isinstance(university.name, dict) else {}
        )
        acronym = (
            university.acronym if isinstance(university.acronym, dict) else {}
        )
        major_name = major.name if isinstance(major.name, dict) else {}
        criteria = (
            offering.admission_criteria
            if isinstance(offering.admission_criteria, dict)
            else {}
        )
        last_checked = criteria.get("checked_at")
        if isinstance(last_checked, (date, datetime)):
            last_checked = last_checked.isoformat()
        notes = criteria.get("notes")
        verified = bool(
            offering.min_bacii_grade and offering.is_admission_verified
        )
        missing = offering.min_bacii_grade is None
        unverified = bool(
            offering.min_bacii_grade and not offering.is_admission_verified
        )

        if verified:
            verified_count += 1
            if not offering.admission_source_url:
                missing_source_count += 1
        elif missing:
            missing_count += 1
        else:
            unverified_count += 1

        if last_checked and (not last_checked_any or last_checked > last_checked_any):
            last_checked_any = last_checked

        program = {
            "id": str(offering.id),
            "university_id": str(university.id),
            "university_slug": university.slug,
            "university_name_en": university_name.get("en", ""),
            "university_name_km": university_name.get("km", ""),
            "university_acronym_en": acronym.get("en", ""),
            "university_acronym_km": acronym.get("km", ""),
            "university_type": university.university_type,
            "province": university.province,
            "major_slug": major.slug,
            "major_name_en": major_name.get("en", ""),
            "major_name_km": major_name.get("km", ""),
            "major_category": major.category,
            "degree_level": offering.degree_level,
            "duration_years": float(offering.duration_years)
            if offering.duration_years is not None
            else None,
            "min_bacii_grade": offering.min_bacii_grade,
            "required_subjects": offering.required_subjects,
            "is_admission_verified": bool(offering.is_admission_verified),
            "admission_source_url": offering.admission_source_url,
            "admission_notes": notes,
            "last_checked": last_checked,
            "status": "VERIFIED" if verified else "MISSING" if missing else "UNVERIFIED",
        }
        programs.append(program)

        key = str(university.id)
        bucket = institutions.get(key)
        if not bucket:
            bucket = {
                "university_id": key,
                "slug": university.slug,
                "name_en": university_name.get("en", ""),
                "name_km": university_name.get("km", ""),
                "acronym_en": acronym.get("en", ""),
                "acronym_km": acronym.get("km", ""),
                "university_type": university.university_type,
                "province": university.province,
                "total_programs": 0,
                "verified_programs": 0,
                "missing_programs": 0,
                "unverified_programs": 0,
                "last_checked": None,
            }
            institutions[key] = bucket
        bucket["total_programs"] += 1
        if verified:
            bucket["verified_programs"] += 1
        elif missing:
            bucket["missing_programs"] += 1
        else:
            bucket["unverified_programs"] += 1
        if last_checked and (
            not bucket["last_checked"] or last_checked > bucket["last_checked"]
        ):
            bucket["last_checked"] = last_checked

    institution_rows = []
    for bucket in institutions.values():
        total = bucket["total_programs"]
        bucket["coverage_percent"] = (
            round((bucket["verified_programs"] / total) * 100) if total else 0
        )
        institution_rows.append(bucket)
    institution_rows.sort(
        key=lambda item: (
            -item["missing_programs"],
            -item["unverified_programs"],
            item["name_en"].lower(),
        )
    )

    total_programs = len(programs)
    covered_institutions = sum(
        1 for item in institution_rows if item["verified_programs"] > 0
    )
    summary = {
        "total_programs": total_programs,
        "verified_programs": verified_count,
        "missing_programs": missing_count,
        "unverified_programs": unverified_count,
        "coverage_percent": round((verified_count / total_programs) * 100)
        if total_programs
        else 0,
        "institutions_total": len(institution_rows),
        "institutions_covered": covered_institutions,
        "institutions_with_missing": sum(
            1
            for item in institution_rows
            if item["missing_programs"] > 0 or item["unverified_programs"] > 0
        ),
        "missing_source_programs": missing_source_count,
        "last_checked": last_checked_any,
    }

    return ApiResponse(
        success=True,
        data={
            "summary": summary,
            "institutions": institution_rows,
            "programs": programs,
        },
    )


@router.post("/admission-coverage/import", response_model=ApiResponse[Dict[str, Any]])
async def import_admission_coverage(
    body: AdmissionCoverageImportIn,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = 0
    errors: List[Dict[str, Any]] = []
    checked_at = date.today().isoformat()

    for row in body.rows:
        offering = (
            await db.execute(
                select(UniversityMajor).where(UniversityMajor.id == row.offering_id)
            )
        ).scalar_one_or_none()
        if not offering:
            errors.append(
                {
                    "offering_id": str(row.offering_id),
                    "error": "Offering not found",
                }
            )
            continue
        if (
            row.min_bacii_grade == "F"
            and offering.degree_level != "ASSOCIATE"
        ):
            errors.append(
                {
                    "offering_id": str(row.offering_id),
                    "error": "Grade F is only valid for associate programs",
                }
            )
            continue

        changed = False
        fields = row.model_fields_set
        if "min_bacii_grade" in fields:
            offering.min_bacii_grade = row.min_bacii_grade
            changed = True
        if "is_admission_verified" in fields and row.is_admission_verified is not None:
            offering.is_admission_verified = bool(row.is_admission_verified)
            changed = True
        if "admission_source_url" in fields:
            offering.admission_source_url = (
                row.admission_source_url.strip()
                if row.admission_source_url
                else None
            )
            changed = True

        criteria = (
            offering.admission_criteria
            if isinstance(offering.admission_criteria, dict)
            else {}
        )
        criteria = dict(criteria)
        if "admission_notes" in fields:
            notes = (row.admission_notes or "").strip()
            if notes:
                criteria["notes"] = notes
            else:
                criteria.pop("notes", None)
            changed = True
        if changed:
            criteria["scope"] = "admin-import"
            criteria["checked_at"] = checked_at
            offering.admission_criteria = criteria
            updated += 1

    if updated:
        await _audit(
            db,
            admin_user,
            "import",
            "admission_coverage",
            None,
            {"updated": updated, "errors": len(errors)},
        )
    await db.commit()
    return ApiResponse(
        success=True,
        message=f"Updated {updated} program(s)",
        data={"updated": updated, "errors": errors},
    )
