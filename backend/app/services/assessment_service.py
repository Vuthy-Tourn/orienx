import uuid
from typing import Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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


class AssessmentService:

    @staticmethod
    async def calculate_personality(
        session: AsyncSession,
        assessment_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> PersonalityResult:
        # Load answers with options
        stmt = (
            select(PersonalityAnswer, PersonalityOption)
            .join(PersonalityOption, PersonalityAnswer.selected_option_id == PersonalityOption.id)
            .where(PersonalityAnswer.assessment_id == assessment_id)
        )
        res = await session.execute(stmt)
        rows = res.all()

        trait_scores = {"E": 0.0, "I": 0.0, "S": 0.0, "N": 0.0, "T": 0.0, "F": 0.0, "J": 0.0, "P": 0.0}

        for ans, opt in rows:
            trait = opt.target_trait
            if trait in trait_scores:
                trait_scores[trait] += float(opt.weight)

        # Normalize dimensions (0% to 100%)
        def calc_pair(t1: str, t2: str) -> Tuple[float, float, str]:
            s1, s2 = trait_scores[t1], trait_scores[t2]
            total = s1 + s2
            if total == 0:
                return 50.0, 50.0, t1
            p1 = round((s1 / total) * 100.0, 2)
            p2 = round((s2 / total) * 100.0, 2)
            dominant = t1 if p1 >= p2 else t2
            return p1, p2, dominant

        e_pct, i_pct, ei_dom = calc_pair("E", "I")
        s_pct, n_pct, sn_dom = calc_pair("S", "N")
        t_pct, f_pct, tf_dom = calc_pair("T", "F")
        j_pct, p_pct, jp_dom = calc_pair("J", "P")

        mbti_type = f"{ei_dom}{sn_dom}{tf_dom}{jp_dom}"

        # Personality Type Archetypes with Khmer & English insights
        archetypes = {
            "INTJ": {
                "en": {
                    "title": "The Strategic Architect",
                    "strengths": ["Strategic planning", "High analytical rigor", "Independent problem solving"],
                    "growth_areas": ["Patience with team members", "Expressing emotional nuances"],
                    "learning_style": "Theoretical conceptualization followed by structured independent execution",
                    "best_fields": ["Software Architecture", "Data Science", "Structural Engineering"]
                },
                "km": {
                    "title": "អ្នកយុទ្ធសាស្ត្រ និងស្ថាបត្យករគំនិត",
                    "strengths": ["ការរៀបចំយុទ្ធសាស្ត្រច្បាស់លាស់", "ការវិភាគស៊ីជម្រៅ", "ការដោះស្រាយបញ្ហាដោយឯករាជ្យ"],
                    "growth_areas": ["ការបង្កើនការអត់ធ្មត់ជាមួយមិត្តរួមក្រុម", "ការបង្ហាញអារម្មណ៍"],
                    "learning_style": "រៀនតាមរយៈទស្សនទានទ្រឹស្តី និងអនុវត្តគម្រោងដោយស្ងប់ស្ងាត់",
                    "best_fields": ["ស្ថាបត្យកម្មកម្មវិធី", "វិទ្យាសាស្ត្រទិន្នន័យ", "វិស្វកម្មសំណង់"]
                }
            },
            "INTP": {
                "en": {
                    "title": "The Innovative Logician",
                    "strengths": ["Original thinking", "Abstract modeling", "Deep curiosity"],
                    "growth_areas": ["Meeting rigid deadlines", "Organizing practical details"],
                    "learning_style": "Exploratory open-ended research and hypothesis testing",
                    "best_fields": ["Artificial Intelligence", "Pure Mathematics", "Theoretical Physics"]
                },
                "km": {
                    "title": "អ្នកតក្កវិជ្ជានវានុវត្តន៍",
                    "strengths": ["គំនិតច្នៃប្រឌិតថ្មីៗ", "ការបង្កើតគំរូអរូបី", "ការចង់ដឹងចង់ឃើញខ្ពស់"],
                    "growth_areas": ["ការគោរពពេលវេលាកំណត់តឹងរ៉ឹង", "ការរៀបចំលម្អិត"],
                    "learning_style": "ការរៀនតាមរយៈការស្រាវជ្រាវដោយសេរី និងសាកល្បងសម្មតិកម្ម",
                    "best_fields": ["បញ្ញាសិប្បនិម្មិត", "គណិតវិទ្យាសុទ្ធ", "រូបវិទ្យា"]
                }
            },
            "ENTJ": {
                "en": {
                    "title": "The Decisive Commander",
                    "strengths": ["Strong leadership", "Clear strategic vision", "Decisive execution"],
                    "growth_areas": ["Active listening to emotional concerns", "Avoiding over-controlling"],
                    "learning_style": "High-stakes case studies and competitive team leadership",
                    "best_fields": ["Business Administration", "Corporate Finance", "Tech Entrepreneurship"]
                },
                "km": {
                    "title": "អ្នកដឹកនាំម៉ឺងម៉ាត់",
                    "strengths": ["ភាពជាអ្នកដឹកនាំខ្លាំង", "ចក្ខុវិស័យយុទ្ធសាស្ត្រច្បាស់", "ការសម្រេចចិត្តរហ័ស"],
                    "growth_areas": ["ការស្តាប់អារម្មណ៍អ្នកដទៃ", "កាត់បន្ថយការគ្រប់គ្រងហួសហេតុ"],
                    "learning_style": "សិក្សាតាមរយៈករណីធុរកិច្ចជាក់ស្តែង និងការដឹកនាំក្រុមប្រកួតប្រជែង",
                    "best_fields": ["រដ្ឋបាលពាណិជ្ជកម្ម", "ហិរញ្ញវត្ថុស្ថាប័ន", "សហគ្រិនភាព"]
                }
            }
        }

        default_archetype = {
            "en": {
                "title": f"The {mbti_type} Profile",
                "strengths": ["Adaptability", "Goal orientation", "Dedicated focus"],
                "growth_areas": ["Balancing detail and big picture", "Time optimization"],
                "learning_style": "Blended conceptual and practical learning",
                "best_fields": ["Multidisciplinary studies"]
            },
            "km": {
                "title": f"ទម្រង់បុគ្គលិកលក្ខណៈ {mbti_type}",
                "strengths": ["ភាពបត់បែនខ្ពស់", "ការផ្តោតលើគោលដៅ", "ការយកចិត្តទុកដាក់"],
                "growth_areas": ["ការថ្លឹងថ្លែងរវាងរូបភាពធំ និងព័ត៌មានលម្អិត"],
                "learning_style": "ការរៀនចម្រុះរវាងទ្រឹស្តី និងការអនុវត្តជាក់ស្តែង",
                "best_fields": ["ជំនាញពហុវិស័យ"]
            }
        }

        summary = archetypes.get(mbti_type, default_archetype)

        # Check existing result
        stmt_exist = select(PersonalityResult).where(PersonalityResult.assessment_id == assessment_id)
        res_exist = await session.execute(stmt_exist)
        result = res_exist.scalar_one_or_none()

        if not result:
            result = PersonalityResult(
                assessment_id=assessment_id,
                user_id=user_id,
                personality_type=mbti_type,
                extraversion_score=e_pct,
                introversion_score=i_pct,
                sensing_score=s_pct,
                intuition_score=n_pct,
                thinking_score=t_pct,
                feeling_score=f_pct,
                judging_score=j_pct,
                perceiving_score=p_pct,
                traits_summary_en=summary["en"],
                traits_summary_km=summary["km"]
            )
            session.add(result)
        else:
            result.personality_type = mbti_type
            result.extraversion_score = e_pct
            result.introversion_score = i_pct
            result.sensing_score = s_pct
            result.intuition_score = n_pct
            result.thinking_score = t_pct
            result.feeling_score = f_pct
            result.judging_score = j_pct
            result.perceiving_score = p_pct
            result.traits_summary_en = summary["en"]
            result.traits_summary_km = summary["km"]

        await session.flush()
        return result

    @staticmethod
    async def calculate_riasec(
        session: AsyncSession,
        assessment_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> RiasecResult:
        # Load answers with question category
        stmt = (
            select(RiasecAnswer, RiasecQuestion)
            .join(RiasecQuestion, RiasecAnswer.question_id == RiasecQuestion.id)
            .where(RiasecAnswer.assessment_id == assessment_id)
        )
        res = await session.execute(stmt)
        rows = res.all()

        category_totals = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}
        category_counts = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}

        for ans, q in rows:
            cat = q.category
            if cat in category_totals:
                category_totals[cat] += ans.rating
                category_counts[cat] += 1

        # Normalize to percentage score (1 to 5 scale: 1=20%, 5=100%)
        normalized_scores = {}
        for cat in ["R", "I", "A", "S", "E", "C"]:
            count = category_counts[cat] or 1
            avg = category_totals[cat] / count
            normalized_scores[cat] = round((avg / 5.0) * 100.0, 2)

        # Derive 3-letter Holland code sorted by highest scores
        sorted_cats = sorted(normalized_scores.items(), key=lambda item: item[1], reverse=True)
        holland_code = "".join([c[0] for c in sorted_cats[:3]])

        analysis_en = {
            "top_categories": [
                {"code": c[0], "percentage": c[1]} for c in sorted_cats
            ],
            "primary_domain": sorted_cats[0][0],
            "holland_code": holland_code,
            "interpretation": f"Your dominant career interest code is {holland_code}. You excel in environments matching these three dimensions."
        }
        
        analysis_km = {
            "top_categories": [
                {"code": c[0], "percentage": c[1]} for c in sorted_cats
            ],
            "primary_domain": sorted_cats[0][0],
            "holland_code": holland_code,
            "interpretation": f"កូដចំណាប់អារម្មណ៍អាជីពចម្បងរបស់អ្នកគឺ {holland_code}។ អ្នកនឹងរីកចម្រើនខ្លាំងក្នុងបរិស្ថានការងារដែលឆ្លុះបញ្ចាំងពីវិស័យទាំងបីនេះ។"
        }

        stmt_exist = select(RiasecResult).where(RiasecResult.assessment_id == assessment_id)
        res_exist = await session.execute(stmt_exist)
        result = res_exist.scalar_one_or_none()

        if not result:
            result = RiasecResult(
                assessment_id=assessment_id,
                user_id=user_id,
                holland_code=holland_code,
                realistic_score=normalized_scores["R"],
                investigative_score=normalized_scores["I"],
                artistic_score=normalized_scores["A"],
                social_score=normalized_scores["S"],
                enterprising_score=normalized_scores["E"],
                conventional_score=normalized_scores["C"],
                analysis_en=analysis_en,
                analysis_km=analysis_km
            )
            session.add(result)
        else:
            result.holland_code = holland_code
            result.realistic_score = normalized_scores["R"]
            result.investigative_score = normalized_scores["I"]
            result.artistic_score = normalized_scores["A"]
            result.social_score = normalized_scores["S"]
            result.enterprising_score = normalized_scores["E"]
            result.conventional_score = normalized_scores["C"]
            result.analysis_en = analysis_en
            result.analysis_km = analysis_km

        await session.flush()
        return result

