import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.auth import User, Role
from app.models.profile import StudentProfile
from app.models.catalog import University, Major, Career
from app.models.scholarship import Scholarship
from app.models.assessment import PersonalityAssessment, RiasecAssessment
from app.models.recommendation import MajorRecommendation, RecommendationRule
from app.schemas.admin import AdminAnalyticsOut, UserManagementOut, RuleUpdateIn
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
            popular_universities=popular_unis
        )
    )


@router.get("/users", response_model=ApiResponse[List[UserManagementOut]])
async def list_users(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(selectinload(User.roles), selectinload(User.profile))
        .order_by(User.created_at.desc())
        .limit(50)
    )
    res = await db.execute(stmt)
    users = res.scalars().all()

    data = [
        UserManagementOut(
            id=u.id,
            email=u.email,
            status=u.status,
            roles=[r.name for r in u.roles],
            full_name_en=u.profile.full_name_en if u.profile else None,
            province=u.profile.province if u.profile else None,
            created_at=str(u.created_at)
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

