import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.auth import User
from app.models.recommendation import MajorRecommendation
from app.models.catalog import Major, UniversityMajor, University
from app.schemas.recommendation import MajorRecommendationOut, RecommendationGenerateIn
from app.schemas.catalog import MajorSummaryOut, MajorOfferingUniversityOut
from app.schemas.common import ApiResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter()


def _map_recommendation_out(r: MajorRecommendation) -> MajorRecommendationOut:
    offering_unis = [
        MajorOfferingUniversityOut(
            university_id=um.university.id,
            university_slug=um.university.slug,
            university_name=um.university.name,
            university_acronym=um.university.acronym,
            university_type=um.university.university_type,
            province=um.university.province,
            tuition_annual_usd=float(um.tuition_annual_usd) if um.tuition_annual_usd is not None else None,
            is_tuition_verified=um.is_tuition_verified,
            duration_years=float(um.duration_years) if um.duration_years is not None else 4.0,
            degree_level=um.degree_level or "BACHELOR",
            logo_url=um.university.logo_url
        )
        for um in (r.major.university_majors if r.major and r.major.university_majors else [])
        if um.university
    ]
    return MajorRecommendationOut(
        id=r.id,
        major_id=r.major_id,
        major=MajorSummaryOut(
            id=r.major.id,
            slug=r.major.slug,
            name=r.major.name,
            category=r.major.category,
            description=r.major.description,
            riasec_primary=r.major.riasec_primary,
            riasec_secondary=r.major.riasec_secondary,
            personality_affinity=r.major.personality_affinity,
            is_stem=r.major.is_stem,
            universities_count=len(r.major.university_majors) if r.major and r.major.university_majors else 0,
            offering_universities=offering_unis
        ),
        match_score=float(r.match_score),
        personality_match_score=float(r.personality_match_score),
        riasec_match_score=float(r.riasec_match_score),
        academic_match_score=float(r.academic_match_score),
        career_match_score=float(r.career_match_score),
        explanation=r.explanation,
        rank_position=r.rank_position
    )


@router.post("/generate", response_model=ApiResponse[List[MajorRecommendationOut]])
async def generate_recommendations(
    body: Optional[RecommendationGenerateIn] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    recs = await RecommendationService.generate_recommendations(db, current_user.id)

    # Re-query with majors and offering universities loaded
    stmt = (
        select(MajorRecommendation)
        .options(
            selectinload(MajorRecommendation.major)
            .selectinload(Major.university_majors)
            .selectinload(UniversityMajor.university)
        )
        .where(MajorRecommendation.user_id == current_user.id)
        .order_by(MajorRecommendation.rank_position.asc())
    )
    res = await db.execute(stmt)
    loaded_recs = res.scalars().all()

    data = [_map_recommendation_out(r) for r in loaded_recs]

    return ApiResponse(
        success=True,
        message=(
            "Recommendations calculated with explainable rationale"
            if data
            else "Complete at least one assessment to unlock recommendations"
        ),
        data=data
    )


@router.get("/majors", response_model=ApiResponse[List[MajorRecommendationOut]])
async def get_recommended_majors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(MajorRecommendation)
        .options(
            selectinload(MajorRecommendation.major)
            .selectinload(Major.university_majors)
            .selectinload(UniversityMajor.university)
        )
        .where(MajorRecommendation.user_id == current_user.id)
        .order_by(MajorRecommendation.rank_position.asc())
    )
    res = await db.execute(stmt)
    recs = res.scalars().all()

    # If no recommendations generated yet, automatically run generation
    if not recs:
        await RecommendationService.generate_recommendations(db, current_user.id)
        res = await db.execute(stmt)
        recs = res.scalars().all()

    data = [_map_recommendation_out(r) for r in recs]

    return ApiResponse(
        success=True,
        message=(
            "Recommendations loaded"
            if data
            else "Complete at least one assessment to unlock recommendations"
        ),
        data=data
    )


@router.get("/majors/{major_id}/explain")
async def explain_major_recommendation(
    major_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(MajorRecommendation)
        .options(selectinload(MajorRecommendation.major))
        .where(
            MajorRecommendation.user_id == current_user.id,
            MajorRecommendation.major_id == major_id
        )
    )
    res = await db.execute(stmt)
    rec = res.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation explanation not found")

    return ApiResponse(
        success=True,
        data={
            "major_name": rec.major.name,
            "rank_position": rec.rank_position,
            "overall_match_score": float(rec.match_score),
            "score_breakdown": {
                "riasec_fit": float(rec.riasec_match_score),
                "academic_fit": float(rec.academic_match_score),
                "personality_fit": float(rec.personality_match_score),
                "career_alignment": float(rec.career_match_score)
            },
            "explanation": rec.explanation
        }
    )

