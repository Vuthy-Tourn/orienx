import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.auth import User
from app.models.assessment import (
    PersonalityQuestion,
    PersonalityOption,
    PersonalityAssessment,
    PersonalityAnswer,
    PersonalityResult,
    RiasecQuestion,
    RiasecAssessment,
    RiasecAnswer,
    RiasecResult,
)
from app.models.preferences import AcademicPreferences
from app.schemas.assessment import (
    PersonalityQuestionOut,
    PersonalityOptionOut,
    PersonalitySubmitIn,
    PersonalityResultOut,
    RiasecQuestionOut,
    RiasecSubmitIn,
    RiasecResultOut,
    AcademicPreferencesIn,
    AcademicPreferencesOut,
)
from app.schemas.common import ApiResponse
from app.services.assessment_service import AssessmentService

router = APIRouter()


# -----------------------------------------------------------------------------
# PERSONALITY ASSESSMENT
# -----------------------------------------------------------------------------
@router.get("/personality/questions", response_model=ApiResponse[List[PersonalityQuestionOut]])
async def get_personality_questions(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(PersonalityQuestion)
        .options(selectinload(PersonalityQuestion.options))
        .where(PersonalityQuestion.is_active == True)
        .order_by(PersonalityQuestion.order_index.asc())
    )
    res = await db.execute(stmt)
    questions = res.scalars().all()

    data = [
        PersonalityQuestionOut(
            id=q.id,
            dimension=q.dimension,
            prompt_en=q.prompt_en,
            prompt_km=q.prompt_km,
            order_index=q.order_index,
            options=[
                PersonalityOptionOut(
                    id=opt.id,
                    label_en=opt.label_en,
                    label_km=opt.label_km,
                    target_trait=opt.target_trait,
                    order_index=opt.order_index
                )
                for opt in q.options
            ]
        )
        for q in questions
    ]
    return ApiResponse(success=True, data=data)


@router.post("/personality/submit", response_model=ApiResponse[PersonalityResultOut])
async def submit_personality_assessment(
    body: PersonalitySubmitIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not body.answers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one answer is required")

    # Create assessment record
    assessment = PersonalityAssessment(
        user_id=current_user.id,
        status="COMPLETED",
        completed_at=datetime.now(timezone.utc)
    )
    db.add(assessment)
    await db.flush()

    # Save answers
    for ans in body.answers:
        pa = PersonalityAnswer(
            assessment_id=assessment.id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id
        )
        db.add(pa)
    await db.flush()

    # Calculate result
    result = await AssessmentService.calculate_personality(db, assessment.id, current_user.id)
    await db.commit()

    return ApiResponse(
        success=True,
        message="Personality assessment evaluated successfully",
        data=PersonalityResultOut(
            id=result.id,
            personality_type=result.personality_type,
            extraversion_score=float(result.extraversion_score),
            introversion_score=float(result.introversion_score),
            sensing_score=float(result.sensing_score),
            intuition_score=float(result.intuition_score),
            thinking_score=float(result.thinking_score),
            feeling_score=float(result.feeling_score),
            judging_score=float(result.judging_score),
            perceiving_score=float(result.perceiving_score),
            traits_summary_en=result.traits_summary_en,
            traits_summary_km=result.traits_summary_km
        )
    )


@router.get("/personality/latest", response_model=ApiResponse[Optional[PersonalityResultOut]])
async def get_latest_personality(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(PersonalityResult)
        .where(PersonalityResult.user_id == current_user.id)
        .order_by(PersonalityResult.created_at.desc())
        .limit(1)
    )
    res = await db.execute(stmt)
    result = res.scalar_one_or_none()
    if not result:
        return ApiResponse(success=True, data=None)

    return ApiResponse(
        success=True,
        data=PersonalityResultOut(
            id=result.id,
            personality_type=result.personality_type,
            extraversion_score=float(result.extraversion_score),
            introversion_score=float(result.introversion_score),
            sensing_score=float(result.sensing_score),
            intuition_score=float(result.intuition_score),
            thinking_score=float(result.thinking_score),
            feeling_score=float(result.feeling_score),
            judging_score=float(result.judging_score),
            perceiving_score=float(result.perceiving_score),
            traits_summary_en=result.traits_summary_en,
            traits_summary_km=result.traits_summary_km
        )
    )


# -----------------------------------------------------------------------------
# RIASEC CAREER INTEREST ASSESSMENT
# -----------------------------------------------------------------------------
@router.get("/riasec/questions", response_model=ApiResponse[List[RiasecQuestionOut]])
async def get_riasec_questions(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(RiasecQuestion)
        .where(RiasecQuestion.is_active == True)
        .order_by(RiasecQuestion.order_index.asc())
    )
    res = await db.execute(stmt)
    questions = res.scalars().all()

    data = [
        RiasecQuestionOut(
            id=q.id,
            category=q.category,
            prompt_en=q.prompt_en,
            prompt_km=q.prompt_km,
            order_index=q.order_index
        )
        for q in questions
    ]
    return ApiResponse(success=True, data=data)


@router.post("/riasec/submit", response_model=ApiResponse[RiasecResultOut])
async def submit_riasec_assessment(
    body: RiasecSubmitIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not body.answers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one answer is required")

    assessment = RiasecAssessment(
        user_id=current_user.id,
        status="COMPLETED",
        completed_at=datetime.now(timezone.utc)
    )
    db.add(assessment)
    await db.flush()

    for ans in body.answers:
        ra = RiasecAnswer(
            assessment_id=assessment.id,
            question_id=ans.question_id,
            rating=max(1, min(5, ans.rating))
        )
        db.add(ra)
    await db.flush()

    result = await AssessmentService.calculate_riasec(db, assessment.id, current_user.id)
    await db.commit()

    return ApiResponse(
        success=True,
        message="RIASEC career interest profile calculated successfully",
        data=RiasecResultOut(
            id=result.id,
            holland_code=result.holland_code,
            realistic_score=float(result.realistic_score),
            investigative_score=float(result.investigative_score),
            artistic_score=float(result.artistic_score),
            social_score=float(result.social_score),
            enterprising_score=float(result.enterprising_score),
            conventional_score=float(result.conventional_score),
            analysis_en=result.analysis_en,
            analysis_km=result.analysis_km
        )
    )


@router.get("/riasec/latest", response_model=ApiResponse[Optional[RiasecResultOut]])
async def get_latest_riasec(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(RiasecResult)
        .where(RiasecResult.user_id == current_user.id)
        .order_by(RiasecResult.created_at.desc())
        .limit(1)
    )
    res = await db.execute(stmt)
    result = res.scalar_one_or_none()
    if not result:
        return ApiResponse(success=True, data=None)

    return ApiResponse(
        success=True,
        data=RiasecResultOut(
            id=result.id,
            holland_code=result.holland_code,
            realistic_score=float(result.realistic_score),
            investigative_score=float(result.investigative_score),
            artistic_score=float(result.artistic_score),
            social_score=float(result.social_score),
            enterprising_score=float(result.enterprising_score),
            conventional_score=float(result.conventional_score),
            analysis_en=result.analysis_en,
            analysis_km=result.analysis_km
        )
    )


# -----------------------------------------------------------------------------
# ACADEMIC PREFERENCES
# -----------------------------------------------------------------------------
@router.get("/preferences", response_model=ApiResponse[Optional[AcademicPreferencesOut]])
async def get_academic_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AcademicPreferences).where(AcademicPreferences.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()
    if not pref:
        return ApiResponse(success=True, data=None)

    return ApiResponse(
        success=True,
        data=AcademicPreferencesOut(
            id=pref.id,
            user_id=pref.user_id,
            favorite_subjects=pref.favorite_subjects,
            strongest_subjects=pref.strongest_subjects,
            enjoyed_activities=pref.enjoyed_activities,
            preferred_work_environments=pref.preferred_work_environments,
            preferred_learning_style=pref.preferred_learning_style,
            career_interest_areas=pref.career_interest_areas,
            preferred_locations=pref.preferred_locations,
            annual_tuition_budget_usd=float(pref.annual_tuition_budget_usd) if pref.annual_tuition_budget_usd else None,
            requires_scholarship=pref.requires_scholarship
        )
    )


@router.put("/preferences", response_model=ApiResponse[AcademicPreferencesOut])
async def save_academic_preferences(
    body: AcademicPreferencesIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AcademicPreferences).where(AcademicPreferences.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()

    if not pref:
        pref = AcademicPreferences(
            user_id=current_user.id,
            favorite_subjects=body.favorite_subjects,
            strongest_subjects=body.strongest_subjects,
            enjoyed_activities=body.enjoyed_activities,
            preferred_work_environments=body.preferred_work_environments,
            preferred_learning_style=body.preferred_learning_style,
            career_interest_areas=body.career_interest_areas,
            preferred_locations=body.preferred_locations,
            annual_tuition_budget_usd=body.annual_tuition_budget_usd,
            requires_scholarship=body.requires_scholarship
        )
        db.add(pref)
    else:
        pref.favorite_subjects = body.favorite_subjects
        pref.strongest_subjects = body.strongest_subjects
        pref.enjoyed_activities = body.enjoyed_activities
        pref.preferred_work_environments = body.preferred_work_environments
        pref.preferred_learning_style = body.preferred_learning_style
        pref.career_interest_areas = body.career_interest_areas
        pref.preferred_locations = body.preferred_locations
        pref.annual_tuition_budget_usd = body.annual_tuition_budget_usd
        pref.requires_scholarship = body.requires_scholarship

    await db.commit()
    await db.refresh(pref)

    return ApiResponse(
        success=True,
        message="Preferences saved successfully",
        data=AcademicPreferencesOut(
            id=pref.id,
            user_id=pref.user_id,
            favorite_subjects=pref.favorite_subjects,
            strongest_subjects=pref.strongest_subjects,
            enjoyed_activities=pref.enjoyed_activities,
            preferred_work_environments=pref.preferred_work_environments,
            preferred_learning_style=pref.preferred_learning_style,
            career_interest_areas=pref.career_interest_areas,
            preferred_locations=pref.preferred_locations,
            annual_tuition_budget_usd=float(pref.annual_tuition_budget_usd) if pref.annual_tuition_budget_usd else None,
            requires_scholarship=pref.requires_scholarship
        )
    )

