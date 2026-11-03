import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.models.catalog import Major, UniversityMajor, University, Career
from app.models.assessment import PersonalityResult, RiasecResult
from app.models.preferences import AcademicPreferences
from app.models.recommendation import RecommendationRule, MajorRecommendation


class RecommendationService:

    @staticmethod
    async def generate_recommendations(
        session: AsyncSession,
        user_id: uuid.UUID
    ) -> List[MajorRecommendation]:
        # 1. Fetch latest assessment results and preferences
        stmt_p = select(PersonalityResult).where(PersonalityResult.user_id == user_id).order_by(PersonalityResult.created_at.desc()).limit(1)
        res_p = await session.execute(stmt_p)
        personality = res_p.scalars().first()

        stmt_r = select(RiasecResult).where(RiasecResult.user_id == user_id).order_by(RiasecResult.created_at.desc()).limit(1)
        res_r = await session.execute(stmt_r)
        riasec = res_r.scalars().first()

        stmt_pref = select(AcademicPreferences).where(AcademicPreferences.user_id == user_id)
        res_pref = await session.execute(stmt_pref)
        pref = res_pref.scalar_one_or_none()

        # 2. Fetch active rule
        stmt_rule = select(RecommendationRule).where(RecommendationRule.is_active == True).limit(1)
        res_rule = await session.execute(stmt_rule)
        rule = res_rule.scalar_one_or_none()

        w_p = float(rule.weight_personality) if rule else 0.20
        w_r = float(rule.weight_riasec) if rule else 0.35
        w_a = float(rule.weight_academic_strengths) if rule else 0.30
        w_c = float(rule.weight_career_alignment) if rule else 0.15

        # 3. Fetch all majors with relationships
        stmt_majors = (
            select(Major)
            .options(
                selectinload(Major.university_majors).selectinload(UniversityMajor.university),
                selectinload(Major.careers)
            )
        )
        res_majors = await session.execute(stmt_majors)
        majors = res_majors.scalars().all()

        recommendations_to_save = []

        # RIASEC score map
        r_scores = {
            "R": float(riasec.realistic_score) if riasec else 50.0,
            "I": float(riasec.investigative_score) if riasec else 50.0,
            "A": float(riasec.artistic_score) if riasec else 50.0,
            "S": float(riasec.social_score) if riasec else 50.0,
            "E": float(riasec.enterprising_score) if riasec else 50.0,
            "C": float(riasec.conventional_score) if riasec else 50.0,
        }

        user_mbti = personality.personality_type if personality else "INTJ"
        user_strong_subjects = [s.lower() for s in (pref.strongest_subjects if pref else [])]
        user_fav_subjects = [s.lower() for s in (pref.favorite_subjects if pref else [])]
        user_career_interests = [c.lower() for c in (pref.career_interest_areas if pref else [])]
        user_budget = float(pref.annual_tuition_budget_usd) if (pref and pref.annual_tuition_budget_usd) else None

        for major in majors:
            # 1. RIASEC Score (35%)
            prim_score = r_scores.get(major.riasec_primary, 50.0)
            sec_score = r_scores.get(major.riasec_secondary, 50.0)
            s_riasec = round(0.70 * prim_score + 0.30 * sec_score, 2)

            # 2. Personality Fit (20%)
            s_personality = 60.0
            if major.personality_affinity:
                affinities = [a.strip() for a in major.personality_affinity.split(",")]
                if user_mbti in affinities:
                    s_personality = 95.0
                elif any(user_mbti[:2] in a for a in affinities): # e.g. "IN"
                    s_personality = 80.0
                elif any(user_mbti[2:] in a for a in affinities): # e.g. "TJ"
                    s_personality = 75.0

            # 3. Academic Strengths Fit (30%)
            s_academic = 50.0
            major_skills = [str(sk).lower() for sk in (major.required_skills or [])]
            match_points = 0
            for subj in user_strong_subjects + user_fav_subjects:
                if any(subj in sk or sk in subj for sk in major_skills):
                    match_points += 20
                if "math" in subj and (major.is_stem or "business" in major.category.lower()):
                    match_points += 15
                if "physics" in subj and major.is_stem:
                    match_points += 15

            s_academic = min(100.0, max(45.0, 50.0 + match_points))

            # 4. Career Goal Alignment (15%)
            s_career = 50.0
            for car in major.careers:
                ind = car.industry.lower()
                tit = str(car.title).lower()
                if any(ci in ind or ci in tit for ci in user_career_interests):
                    s_career = 95.0
                    break

            # 5. Constraints & Penalties
            penalty = 0.0
            notes_en = []
            notes_km = []

            # Tuition constraint
            if user_budget is not None and user_budget > 0:
                tuition_fees = [
                    float(um.tuition_annual_usd)
                    for um in major.university_majors
                    if um.tuition_annual_usd is not None
                ]
                if tuition_fees and min(tuition_fees) > user_budget * 1.5:
                    penalty += 10.0
                    notes_en.append(f"Standard tuition at available institutions exceeds your stated budget (${user_budget:.0f}/yr), but scholarship options exist.")
                    notes_km.append(f"តម្លៃសិក្សាជាទូទៅនៅសាកលវិទ្យាល័យអាចលើសពីថវិការបស់អ្នក (${user_budget:.0f}/ឆ្នាំ) ប៉ុន្តែមានជម្រើសអាហារូបករណ៍។")

            # Final composite score
            raw_score = (w_p * s_personality) + (w_r * s_riasec) + (w_a * s_academic) + (w_c * s_career) - penalty
            final_match = round(max(30.0, min(99.0, raw_score)), 1)

            # Build explainable rationale report
            explanation = {
                "fit_summary_en": f"Strong alignment based on your Holland code ({riasec.holland_code if riasec else 'IRE'}) and affinity with analytical problem solving.",
                "fit_summary_km": f"ត្រូវគ្នាយ៉ាងខ្លាំងជាមួយកូដចំណាប់អារម្មណ៍អាជីពរបស់អ្នក ({riasec.holland_code if riasec else 'IRE'}) និងការដោះស្រាយបញ្ហាជាក់ស្តែង។",
                "riasec_reason_en": f"Primary discipline aligns with your {major.riasec_primary} ({prim_score:.0f}%) and {major.riasec_secondary} ({sec_score:.0f}%) interest areas.",
                "riasec_reason_km": f"ជំនាញនេះត្រូវគ្នានឹងវិស័យចំណាប់អារម្មណ៍ចម្បងរបស់អ្នកគឺ {major.riasec_primary} ({prim_score:.0f}%) និង {major.riasec_secondary} ({sec_score:.0f}%)។",
                "personality_reason_en": f"Your {user_mbti} cognitive style matches the independent design and methodical focus required in {major.name.get('en', 'this field')}.",
                "personality_reason_km": f"ទម្រង់បុគ្គលិកលក្ខណៈ {user_mbti} របស់អ្នកត្រូវគ្នានឹងការរៀបចំផែនការ និងការគិតស៊ីជម្រៅក្នុងជំនាញនេះ។",
                "universities_count": len(major.university_majors),
                "careers_count": len(major.careers),
                "constraints_notes_en": notes_en,
                "constraints_notes_km": notes_km
            }

            recommendations_to_save.append({
                "major_id": major.id,
                "major": major,
                "match_score": final_match,
                "personality_match_score": s_personality,
                "riasec_match_score": s_riasec,
                "academic_match_score": s_academic,
                "career_match_score": s_career,
                "explanation": explanation
            })

        # Sort recommendations by match_score descending
        recommendations_to_save.sort(key=lambda x: x["match_score"], reverse=True)

        # Clear existing recommendations for this user
        await session.execute(delete(MajorRecommendation).where(MajorRecommendation.user_id == user_id))

        saved_records = []
        for idx, item in enumerate(recommendations_to_save, start=1):
            rec = MajorRecommendation(
                user_id=user_id,
                major_id=item["major_id"],
                rule_id=rule.id if rule else None,
                match_score=item["match_score"],
                personality_match_score=item["personality_match_score"],
                riasec_match_score=item["riasec_match_score"],
                academic_match_score=item["academic_match_score"],
                career_match_score=item["career_match_score"],
                explanation=item["explanation"],
                rank_position=idx
            )
            session.add(rec)
            saved_records.append(rec)

        await session.commit()
        return saved_records
