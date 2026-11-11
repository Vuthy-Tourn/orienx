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

        # Complete 16Personalities (NERIS-Standard) Archetypes with Khmer & English insights
        archetypes = {
            # --- ANALYSTS (Intuitive & Thinking - _NT_) --- #88619A (Purple)
            "INTJ": {
                "role": "Analysts",
                "role_km": "អ្នកវិភាគ (Analysts)",
                "role_color": "#88619A",
                "en": {
                    "title": "The Architect",
                    "tagline": "Imaginative and strategic thinkers, with a plan for everything.",
                    "strengths": ["Strategic planning", "High analytical rigor", "Independent problem solving"],
                    "growth_areas": ["Patience with team members", "Expressing emotional nuances"],
                    "learning_style": "Theoretical conceptualization followed by structured independent execution",
                    "best_fields": ["Software Architecture", "Data Science & AI", "Structural Engineering"]
                },
                "km": {
                    "title": "The Architect • អ្នកយុទ្ធសាស្ត្រ និងស្ថាបត្យករគំនិត",
                    "tagline": "ការគិតបែបវិភាគស៊ីជម្រៅ ស្វែងរកដំណោះស្រាយប្លែក និងប្រកបដោយប្រសិទ្ធភាពខ្ពស់។",
                    "strengths": ["ការរៀបចំយុទ្ធសាស្ត្រច្បាស់លាស់", "ការវិភាគស៊ីជម្រៅ", "ការដោះស្រាយបញ្ហាដោយឯករាជ្យ"],
                    "growth_areas": ["ការបង្កើនការអត់ធ្មត់ជាមួយមិត្តរួមក្រុម", "ការបង្ហាញអារម្មណ៍"],
                    "learning_style": "រៀនតាមរយៈទស្សនទានទ្រឹស្តី និងអនុវត្តគម្រោងដោយស្ងប់ស្ងាត់",
                    "best_fields": ["ស្ថាបត្យកម្មកម្មវិធី", "វិទ្យាសាស្ត្រទិន្នន័យ", "វិស្វកម្មសំណង់"]
                }
            },
            "INTP": {
                "role": "Analysts",
                "role_km": "អ្នកវិភាគ (Analysts)",
                "role_color": "#88619A",
                "en": {
                    "title": "The Logician",
                    "tagline": "Innovative inventors with an unquenchable thirst for knowledge.",
                    "strengths": ["Original thinking", "Abstract modeling", "Deep curiosity"],
                    "growth_areas": ["Meeting rigid deadlines", "Organizing practical details"],
                    "learning_style": "Exploratory open-ended research and hypothesis testing",
                    "best_fields": ["Artificial Intelligence", "Pure Mathematics", "Theoretical Physics"]
                },
                "km": {
                    "title": "The Logician • អ្នកតក្កវិជ្ជានវានុវត្តន៍",
                    "tagline": "អ្នកច្នៃប្រឌិតនវានុវត្តន៍ ស្រេកឃ្លានចំណេះដឹង និងចូលចិត្តវិភាគប្រព័ន្ធស្មុគស្មាញ។",
                    "strengths": ["គំនិតច្នៃប្រឌិតថ្មីៗ", "ការបង្កើតគំរូអរូបី", "ការចង់ដឹងចង់ឃើញខ្ពស់"],
                    "growth_areas": ["ការគោរពពេលវេលាកំណត់តឹងរ៉ឹង", "ការរៀបចំលម្អិត"],
                    "learning_style": "ការរៀនតាមរយៈការស្រាវជ្រាវដោយសេរី និងសាកល្បងសម្មតិកម្ម",
                    "best_fields": ["បញ្ញាសិប្បនិម្មិត", "គណិតវិទ្យាសុទ្ធ", "រូបវិទ្យា"]
                }
            },
            "ENTJ": {
                "role": "Analysts",
                "role_km": "អ្នកវិភាគ (Analysts)",
                "role_color": "#88619A",
                "en": {
                    "title": "The Commander",
                    "tagline": "Bold, imaginative and strong-willed leaders, finding a way or making one.",
                    "strengths": ["Strategic leadership", "Decisive execution", "Systemic optimization"],
                    "growth_areas": ["Patience with differing paces", "Emotional empathy"],
                    "learning_style": "High-stakes case studies, competitive debates, and team leadership",
                    "best_fields": ["Business Administration", "Corporate Finance", "Tech Entrepreneurship"]
                },
                "km": {
                    "title": "The Commander • អ្នកដឹកនាំចក្ខុវិស័យ",
                    "tagline": "មានភាពជាអ្នកដឹកនាំក្លាហាន ចក្ខុវិស័យយុទ្ធសាស្ត្រច្បាស់ និងការសម្រេចចិត្តរហ័ស។",
                    "strengths": ["ភាពជាអ្នកដឹកនាំយុទ្ធសាស្ត្រ", "ការសម្រេចចិត្តម៉ឺងម៉ាត់", "ការគ្រប់គ្រងប្រព័ន្ធធំៗ"],
                    "growth_areas": ["ការស្តាប់អារម្មណ៍អ្នកដទៃ", "កាត់បន្ថយការគ្រប់គ្រងហួសហេតុ"],
                    "learning_style": "សិក្សាតាមរយៈករណីធុរកិច្ចជាក់ស្តែង និងការដឹកនាំក្រុមប្រកួតប្រជែង",
                    "best_fields": ["រដ្ឋបាលពាណិជ្ជកម្ម", "ហិរញ្ញវត្ថុស្ថាប័ន", "សហគ្រិនភាព"]
                }
            },
            "ENTP": {
                "role": "Analysts",
                "role_km": "អ្នកវិភាគ (Analysts)",
                "role_color": "#88619A",
                "en": {
                    "title": "The Debater",
                    "tagline": "Smart and curious thinkers who cannot resist an intellectual challenge.",
                    "strengths": ["Quick intellectual agility", "Brainstorming novel ideas", "Charismatic verbal debate"],
                    "growth_areas": ["Follow-through on repetitive tasks", "Sensitivity in disputes"],
                    "learning_style": "Dynamic problem-solving workshops and cross-disciplinary debates",
                    "best_fields": ["Product Management", "Law & Diplomacy", "Software Innovation"]
                },
                "km": {
                    "title": "The Debater • អ្នកបង្កើតគំនិត និងពិភាក្សាដេញដោល",
                    "tagline": "ឆ្លាតវៃ រហ័សរហួន ចូលចិត្តបញ្ហាប្រឈមបញ្ញា និងស្វែងរកគំនិតច្នៃប្រឌិតថ្មីៗ។",
                    "strengths": ["ភាពរហ័សរហួននៃបញ្ញា", "ការបង្កើតគំនិតច្នៃប្រឌិត", "ការជជែកវែកញែកស៊ីជម្រៅ"],
                    "growth_areas": ["ការបន្តអនុវត្តកិច្ចការដដែលៗ", "ការសម្របសម្រួលជាមួយអារម្មណ៍អ្នកដទៃ"],
                    "learning_style": "សិក្សាតាមរយៈការជជែកដេញដោល ពិភាក្សាផ្លាស់ប្តូរគំនិត និងសិក្ខាសាលា",
                    "best_fields": ["ការគ្រប់គ្រងផលិតផល", "ច្បាប់ និងទំនាក់ទំនងអន្តរជាតិ", "នវានុវត្តន៍ឌីជីថល"]
                }
            },

            # --- DIPLOMATS (Intuitive & Feeling - _NF_) --- #33A474 (Green)
            "INFJ": {
                "role": "Diplomats",
                "role_km": "អ្នកការទូត (Diplomats)",
                "role_color": "#33A474",
                "en": {
                    "title": "The Advocate",
                    "tagline": "Quiet and mystical, yet very inspiring and tireless idealists.",
                    "strengths": ["Deep visionary empathy", "Principled integrity", "Inspiring written and spoken insight"],
                    "growth_areas": ["Risk of burnout from perfectionism", "Reluctance to open up easily"],
                    "learning_style": "Reflective deep reading, ethical inquiry, and meaningful solo synthesis",
                    "best_fields": ["Psychology & Counseling", "International Diplomacy", "Humanities & Design"]
                },
                "km": {
                    "title": "The Advocate • អ្នកតស៊ូមតិ និងទស្សនវិទូស្ងប់ស្ងាត់",
                    "tagline": "ស្ងប់ស្ងាត់តែមានឥទ្ធិពលបំផុសគំនិតខ្ពស់ ប្រកាន់ខ្ជាប់នូវគោលការណ៍គុណធម៌ និងឧត្តមគតិ។",
                    "strengths": ["ការយល់ចិត្តស៊ីជម្រៅ", "ភាពស្មោះត្រង់នឹងគោលការណ៍", "ការបំផុសគំនិតមនុស្ស"],
                    "growth_areas": ["ហានិភ័យនៃភាពតានតឹងដោយសារភាពឥតខ្ចោះ", "ពិបាកក្នុងការចែករំលែកអារម្មណ៍"],
                    "learning_style": "ការរៀនតាមរយៈការឆ្លុះបញ្ចាំងស្ងប់ស្ងាត់ ការអានស៊ីជម្រៅ និងសីលធម៌",
                    "best_fields": ["ចិត្តវិទ្យា", "ទំនាក់ទំនងអន្តរជាតិ និងការទូត", "មនុស្សសាស្ត្រ"]
                }
            },
            "INFP": {
                "role": "Diplomats",
                "role_km": "អ្នកការទូត (Diplomats)",
                "role_color": "#33A474",
                "en": {
                    "title": "The Mediator",
                    "tagline": "Poetic, kind and altruistic people, always eager to help a good cause.",
                    "strengths": ["Profound personal empathy", "Creative artistic expression", "Open-minded authenticity"],
                    "growth_areas": ["Taking criticism too personally", "Procrastination on rigid schedules"],
                    "learning_style": "Self-directed creative projects, storytelling, and values-driven inquiry",
                    "best_fields": ["Creative Media & Communication", "Education & Social Work", "Literature & Arts"]
                },
                "km": {
                    "title": "The Mediator • អ្នកផ្សះផ្សា និងឧត្តមគតិនិយម",
                    "tagline": "ចិត្តល្អ សុភាពរាបសា មានគំនិតច្នៃប្រឌិតសិល្បៈ និងតែងតែចង់ជួយសង្គមឱ្យកាន់តែប្រសើរ។",
                    "strengths": ["ការយល់ចិត្តនិងមេត្តាធម៌", "ការបញ្ចេញគំនិតសិល្បៈ", "ភាពស្មោះត្រង់ចំពោះខ្លួនឯង"],
                    "growth_areas": ["ការទទួលយកការរិះគន់មកក្នុងចិត្តពេក", "ការពន្យារពេលលើកាលវិភាគតឹងរ៉ឹង"],
                    "learning_style": "គម្រោងច្នៃប្រឌិតផ្ទាល់ខ្លួន ការនិពន្ធ និងការសិក្សាផ្អែកលើគុណតម្លៃ",
                    "best_fields": ["ប្រព័ន្ធផ្សព្វផ្សាយច្នៃប្រឌិត", "គរុកោសល្យ និងការអប់រំ", "ភាសាវិទ្យា និងសិល្បៈ"]
                }
            },
            "ENFJ": {
                "role": "Diplomats",
                "role_km": "អ្នកការទូត (Diplomats)",
                "role_color": "#33A474",
                "en": {
                    "title": "The Protagonist",
                    "tagline": "Charismatic and inspiring leaders, able to mesmerize their listeners.",
                    "strengths": ["Charismatic communication", "Empowering mentorship", "Harmonious team building"],
                    "growth_areas": ["Over-sacrificing personal needs", "Vulnerability to harsh conflict"],
                    "learning_style": "Collaborative group seminars, interactive workshops, and mentorship roles",
                    "best_fields": ["Educational Leadership", "Human Resources", "Public Relations & Diplomacy"]
                },
                "km": {
                    "title": "The Protagonist • អ្នកដឹកនាំលើកទឹកចិត្ត",
                    "tagline": "មានមន្តស្នេហ៍ក្នុងការប្រាស្រ័យទាក់ទង ពូកែលើកទឹកចិត្ត និងជំរុញឱ្យអ្នកដទៃអភិវឌ្ឍសមត្ថភាព។",
                    "strengths": ["ការប្រាស្រ័យទាក់ទងបំផុសគំនិត", "ការបណ្តុះបណ្តាលអ្នកដទៃ", "ការកសាងក្រុមឱ្យមានសាមគ្គីភាព"],
                    "growth_areas": ["ការលះបង់ហួសហេតុភ្លេចខ្លួនឯង", "ពិបាកទប់ទល់នឹងជម្លោះធ្ងន់ធ្ងរ"],
                    "learning_style": "សិក្ខាសាលាអន្តរកម្ម ការធ្វើការជាក្រុម និងការចែករំលែកបទពិសោធន៍",
                    "best_fields": ["ភាពជាអ្នកដឹកនាំអប់រំ", "ធនធានមនុស្ស", "ទំនាក់ទំនងសាធារណៈ"]
                }
            },
            "ENFP": {
                "role": "Diplomats",
                "role_km": "អ្នកការទូត (Diplomats)",
                "role_color": "#33A474",
                "en": {
                    "title": "The Campaigner",
                    "tagline": "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.",
                    "strengths": ["Infectious positive energy", "Visionary curiosity", "Uncanny ability to connect disparate ideas"],
                    "growth_areas": ["Staying focused on repetitive execution", "Overthinking interpersonal feedback"],
                    "learning_style": "Experiential discovery, group brainstorming, and energetic multi-media design",
                    "best_fields": ["Marketing & Digital Media", "Entrepreneurship", "Journalism & Creative Arts"]
                },
                "km": {
                    "title": "The Campaigner • អ្នកចលនានវានុវត្តន៍ និងសេរីភាព",
                    "tagline": "ស្វាហាប់ ច្នៃប្រឌិតខ្ពស់ មានភាពស្និទ្ធស្នាល និងតែងតែនាំមកនូវស្នាមញញឹមដល់មនុស្សជុំវិញ។",
                    "strengths": ["ថាមពលវិជ្ជមានខ្ពស់", "គំនិតច្នៃប្រឌិតទូលំទូលាយ", "ភាពងាយស្រួលក្នុងការប្រាស្រ័យទាក់ទង"],
                    "growth_areas": ["ការផ្តោតលើកិច្ចការដដែលៗយូរ", "ការគិតច្រើនលើការឆ្លើយតបអ្នកដទៃ"],
                    "learning_style": "ការរៀនតាមរយៈបទពិសោធន៍ជាក់ស្តែង ការជជែកផ្លាស់ប្តូរគំនិត និងពហុមេឌា",
                    "best_fields": ["ទីផ្សារ និងប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល", "សហគ្រិនភាព", "សារព័ត៌មាន"]
                }
            },

            # --- SENTINELS (Observant & Judging - _S_J) --- #4298B4 (Blue)
            "ISTJ": {
                "role": "Sentinels",
                "role_km": "អ្នកការពារ (Sentinels)",
                "role_color": "#4298B4",
                "en": {
                    "title": "The Logistician",
                    "tagline": "Practical and fact-minded individuals, whose reliability cannot be doubted.",
                    "strengths": ["Rock-solid dependability", "Attention to precise facts", "Systematic task completion"],
                    "growth_areas": ["Resistance to sudden procedural changes", "Reluctance to express emotional needs"],
                    "learning_style": "Methodical syllabi with transparent expectations, structured steps, and direct rubrics",
                    "best_fields": ["Accounting & Finance", "Civil & Electrical Engineering", "Database Systems"]
                },
                "km": {
                    "title": "The Logistician • អ្នកអនុវត្តប្រព័ន្ធ និងវិន័យ",
                    "tagline": "ផ្តោតលើភាពជាក់លាក់ ការទទួលខុសត្រូវខ្ពស់ និងការប្រកាន់ខ្ជាប់នូវគោលការណ៍ត្រឹមត្រូវ។",
                    "strengths": ["ទំនុកចិត្តខ្ពស់", "ការយកចិត្តទុកដាក់លើការពិតជាក់ស្តែង", "ការបំពេញការងារតាមប្រព័ន្ធ"],
                    "growth_areas": ["ការពិបាកសម្របតាមការផ្លាស់ប្តូរភ្លាមៗ", "ការបង្ហាញអារម្មណ៍ផ្ទាល់ខ្លួន"],
                    "learning_style": "ការរៀនតាមកាលវិភាគច្បាស់លាស់ ជំហានលម្អិត និងគោលការណ៍ណែនាំសុក្រឹត",
                    "best_fields": ["គណនេយ្យ និងហិរញ្ញវត្ថុ", "វិស្វកម្មសំណង់ និងអគ្គិសនី", "ប្រព័ន្ធមូលដ្ឋានទិន្នន័យ"]
                }
            },
            "ISFJ": {
                "role": "Sentinels",
                "role_km": "អ្នកការពារ (Sentinels)",
                "role_color": "#4298B4",
                "en": {
                    "title": "The Defender",
                    "tagline": "Very dedicated and warm protectors, always ready to defend their loved ones.",
                    "strengths": ["Warm practical support", "Exceptional memory for personal details", "Conscientious loyalty"],
                    "growth_areas": ["Overloading oneself with others' tasks", "Reluctance to embrace unproven changes"],
                    "learning_style": "Step-by-step practical guidance with clear real-world community impact",
                    "best_fields": ["Healthcare & Nursing", "Primary Education", "Hospitality & Social Administration"]
                },
                "km": {
                    "title": "The Defender • អ្នកការពារ និងគាំទ្រយ៉ាងស្មោះស្ម័គ្រ",
                    "tagline": "មានចិត្តកក់ក្តៅ លះបង់ខ្ពស់ យកចិត្តទុកដាក់ និងតែងតែត្រៀមខ្លួនការពារជួយអ្នកដទៃ។",
                    "strengths": ["ការគាំទ្រដោយយកចិត្តទុកដាក់", "ការចងចាំព័ត៌មានលម្អិតល្អ", "ភាពស្មោះត្រង់ក្នុងការងារ"],
                    "growth_areas": ["ការទទួលបន្ទុកអ្នកដទៃមកដាក់លើខ្លួនឯងពេក", "ការស្ទាក់ស្ទើរក្នុងការផ្លាស់ប្តូរ"],
                    "learning_style": "ការរៀនតាមការណែនាំជាជំហានៗ ការអនុវត្តផ្ទាល់ដៃ និងការជួយសហគមន៍",
                    "best_fields": ["វិទ្យាសាស្ត្រសុខាភិបាល និងគិលានុបដ្ឋាក", "បឋមសិក្សា", "រដ្ឋបាលសង្គម"]
                }
            },
            "ESTJ": {
                "role": "Sentinels",
                "role_km": "អ្នកការពារ (Sentinels)",
                "role_color": "#4298B4",
                "en": {
                    "title": "The Executive",
                    "tagline": "Excellent administrators, unsurpassed at managing things or people.",
                    "strengths": ["Decisive logistical organization", "High ethical standards", "Punctual execution"],
                    "growth_areas": ["Impatience with perceived disorganization", "Rigidity in informal settings"],
                    "learning_style": "Structured curricula with tangible measurable deliverables and active project oversight",
                    "best_fields": ["Project Management", "Banking & Finance", "Operations & Supply Chain"]
                },
                "km": {
                    "title": "The Executive • អ្នករៀបចំ និងដឹកនាំយុទ្ធសាស្ត្រ",
                    "tagline": "អ្នកពូកែរៀបចំរចនាសម្ព័ន្ធ មានភាពជាអ្នកដឹកនាំជាក់ស្តែង និងការសម្រេចចិត្តប្រកបដោយការទទួលខុសត្រូវខ្ពស់។",
                    "strengths": ["ការរៀបចំផែនការ និងការគ្រប់គ្រង", "វិន័យការងាររឹងមាំ", "ការសម្រេចការងារទាន់ពេលវេលា"],
                    "growth_areas": ["ការមិនសូវអត់ធ្មត់នឹងភាពគ្មានសណ្តាប់ធ្នាប់", "ភាពតឹងរ៉ឹងជ្រុល"],
                    "learning_style": "កម្មវិធីសិក្សាមានរចនាសម្ព័ន្ធ កាលវិភាគច្បាស់ និងការគ្រប់គ្រងគម្រោងជាក់ស្តែង",
                    "best_fields": ["ការគ្រប់គ្រងគម្រោង", "ធនាគារ និងហិរញ្ញវត្ថុ", "ខ្សែចង្វាក់ផ្គត់ផ្គង់"]
                }
            },
            "ESFJ": {
                "role": "Sentinels",
                "role_km": "អ្នកការពារ (Sentinels)",
                "role_color": "#4298B4",
                "en": {
                    "title": "The Consul",
                    "tagline": "Extraordinarily caring, social and popular people, always eager to help.",
                    "strengths": ["Harmonious social bonding", "Unmatched hospitality", "Practical community organizing"],
                    "growth_areas": ["Worrying about social status or criticism", "Hesitancy to challenge established customs"],
                    "learning_style": "Interactive classroom group studies, peer discussions, and hands-on community projects",
                    "best_fields": ["Communications & Public Relations", "Event Management", "Human Resources"]
                },
                "km": {
                    "title": "The Consul • អ្នកសម្របសម្រួល និងយកចិត្តទុកដាក់ខ្ពស់",
                    "tagline": "រួសរាយរាក់ទាក់ ចិត្តល្អ ពូកែបង្កើតទំនាក់ទំនង និងតែងតែចង់ជួយសម្របសម្រួលអ្នកដទៃ។",
                    "strengths": ["ការកសាងទំនាក់ទំនងសង្គម", "ការបដិសណ្ឋារកិច្ចល្អ", "ការរៀបចំកិច្ចការជាក់ស្តែង"],
                    "growth_areas": ["ការព្រួយបារម្ភច្រើនលើគំនិតអ្នកដទៃ", "ការមិនសូវហ៊ានជំទាស់ទម្លាប់ចាស់"],
                    "learning_style": "ការរៀនជាក្រុម ការពិភាក្សាជាមួយមិត្តភក្តិ និងគម្រោងសហគមន៍",
                    "best_fields": ["ទំនាក់ទំនងសាធារណៈ", "ការគ្រប់គ្រងព្រឹត្តិការណ៍", "ការគ្រប់គ្រងធនធានមនុស្ស"]
                }
            },

            # --- EXPLORERS (Observant & Prospecting - _S_P) --- #E4A43C (Amber)
            "ISTP": {
                "role": "Explorers",
                "role_km": "អ្នករុករក (Explorers)",
                "role_color": "#E4A43C",
                "en": {
                    "title": "The Virtuoso",
                    "tagline": "Bold and practical experimenters, masters of all kinds of tools.",
                    "strengths": ["Hands-on troubleshooting", "Calm in crisis", "Pragmatic efficiency"],
                    "growth_areas": ["Risk of becoming easily bored with theory", "Hesitancy with long-term commitments"],
                    "learning_style": "Laboratory experiments, coding trial-and-error, and mechanical tear-downs",
                    "best_fields": ["Computer Systems Engineering", "Mechanical & Robotics Design", "Cybersecurity Diagnostics"]
                },
                "km": {
                    "title": "The Virtuoso • អ្នកអនុវត្តបច្ចេកទេស និងពិសោធន៍ជាក់ស្តែង",
                    "tagline": "ក្លាហាន ពូកែដោះស្រាយបញ្ហាបច្ចេកទេសជាក់ស្តែង និងជាអ្នកជំនាញឧបករណ៍ និងយន្តការ។",
                    "strengths": ["ការដោះស្រាយបញ្ហាផ្ទាល់ដៃ", "ភាពស្ងប់ស្ងាត់ក្នុងគ្រាអាសន្ន", "ប្រសិទ្ធភាពជាក់ស្តែង"],
                    "growth_areas": ["ងាយធុញទ្រាន់នឹងទ្រឹស្តីច្រើន", "ការស្ទាក់ស្ទើរលើការសន្យារយៈពេលវែង"],
                    "learning_style": "ការពិសោធន៍ក្នុងបន្ទប់ពិសោធន៍ ការសាកល្បងកូដ និងការដំឡើងឧបករណ៍",
                    "best_fields": ["វិស្វកម្មប្រព័ន្ធកុំព្យូទ័រ", "វិស្វកម្មមេកានិច និងរ៉ូបូត", "សន្តិសុខសាយប័រ"]
                }
            },
            "ISFP": {
                "role": "Explorers",
                "role_km": "អ្នករុករក (Explorers)",
                "role_color": "#E4A43C",
                "en": {
                    "title": "The Adventurer",
                    "tagline": "Flexible and charming artists, always ready to explore and experience something new.",
                    "strengths": ["Aesthetic visual harmony", "Gentle empathetic presence", "Adaptable spontaneity"],
                    "growth_areas": ["Fluctuating motivation on rigid deadlines", "Avoiding competitive pressures"],
                    "learning_style": "Visual, kinetic, studio-based creation and aesthetic portfolio development",
                    "best_fields": ["UI/UX & Product Design", "Architecture & Interior Design", "Fine Arts & Animation"]
                },
                "km": {
                    "title": "The Adventurer • អ្នកសិល្បៈច្នៃប្រឌិត",
                    "tagline": "មានភាពបត់បែនខ្ពស់ ស្រឡាញ់សិល្បៈ និងតែងតែត្រៀមខ្លួនស្វែងរកបទពិសោធន៍ថ្មីៗជានិច្ច។",
                    "strengths": ["ការយល់ដឹងពីសោភ័ណភាព និងសិល្បៈ", "ភាពទន់ភ្លន់យល់ចិត្ត", "ការសម្របខ្លួនបានរហ័ស"],
                    "growth_areas": ["ការថយចុះថាមពលនៅក្រោមកាលវិភាគតឹងតែង", "ការជៀសវាងការប្រកួតប្រជែងខ្លាំង"],
                    "learning_style": "ការរៀនតាមរយៈរូបភាព សិក្ខាសាលាសិល្បៈ និងការអនុវត្តបង្កើតស្នាដៃផ្ទាល់",
                    "best_fields": ["រចនាបទ UI/UX និងផលិតផលឌីជីថល", "ស្ថាបត្យកម្ម និងរចនាផ្ទៃក្នុង", "សិល្បៈ និងគំនូរជីវចល"]
                }
            },
            "ESTP": {
                "role": "Explorers",
                "role_km": "អ្នករុករក (Explorers)",
                "role_color": "#E4A43C",
                "en": {
                    "title": "The Entrepreneur",
                    "tagline": "Smart, energetic and very perceptive people, who truly enjoy living on the edge.",
                    "strengths": ["Bold risk taking", "Instant observational acuity", "Persuasive dynamism"],
                    "growth_areas": ["Patience with abstract academic theory", "Risk of impulsiveness"],
                    "learning_style": "Action-packed simulations, live negotiation labs, and rapid sprint challenges",
                    "best_fields": ["Sales & Venture Capital", "International Trade", "Sports & Event Management"]
                },
                "km": {
                    "title": "The Entrepreneur • សហគ្រិនស្វាហាប់ និងរហ័សរហួន",
                    "tagline": "ឆ្លាតវៃ ស្វាហាប់ សង្កេតបានរហ័ស និងរីករាយក្នុងការប្រថុយប្រជែងដោះស្រាយបញ្ហាភ្លាមៗ។",
                    "strengths": ["ភាពក្លាហានក្នុងការសម្រេចចិត្ត", "ការសង្កេតស្ថានភាពបានរហ័ស", "សមត្ថភាពបញ្ចុះបញ្ចូលខ្ពស់"],
                    "growth_areas": ["ការអត់ធ្មត់ជាមួយទ្រឹស្តីអរូបី", "ហានិភ័យនៃការសម្រេចចិត្តប្រញាប់ប្រញាល់"],
                    "learning_style": "ការក្លែងបន្លំស្ថានភាពជាក់ស្តែង ការចរចាផ្ទាល់ និងការប្រកួតប្រជែងរហ័ស",
                    "best_fields": ["ពាណិជ្ជកម្ម និងសហគ្រិនភាព", "ពាណិជ្ជកម្មអន្តរជាតិ", "ការគ្រប់គ្រងព្រឹត្តិការណ៍"]
                }
            },
            "ESFP": {
                "role": "Explorers",
                "role_km": "អ្នករុករក (Explorers)",
                "role_color": "#E4A43C",
                "en": {
                    "title": "The Entertainer",
                    "tagline": "Spontaneous, energetic and enthusiastic people – life is never boring around them.",
                    "strengths": ["Playful enthusiasm", "Natural showmanship", "Warm practical generosity"],
                    "growth_areas": ["Focusing on long-term tedious obligations", "Aversion to analytical repetition"],
                    "learning_style": "Performative workshops, community events, and dynamic group storytelling",
                    "best_fields": ["Performing Arts & Media", "Tourism & Hospitality", "Public Relations & Fashion"]
                },
                "km": {
                    "title": "The Entertainer • អ្នកកម្សាន្ត និងបង្កើតភាពរស់រវើក",
                    "tagline": "ស្វាហាប់ រស់រវើក ពោរពេញដោយភាពរីករាយ និងតែងតែធ្វើឱ្យបរិយាកាសជុំវិញមានភាពកក់ក្តៅ។",
                    "strengths": ["ភាពរីករាយស្វាហាប់", "ទេពកោសល្យក្នុងការទាក់ទាញមនុស្ស", "ចិត្តទូលាយ និងរួសរាយ"],
                    "growth_areas": ["ការផ្តោតលើកិច្ចការស្មុគស្មាញរយៈពេលវែង", "ការជៀសវាងការវិភាគស្ងប់ស្ងាត់"],
                    "learning_style": "សិក្ខាសាលាសម្តែង ព្រឹត្តិការណ៍សង្គម និងការបង្កើតទំនាក់ទំនងផ្ទាល់",
                    "best_fields": ["សិល្បៈទស្សនីយភាព និងមេឌា", "ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច", "ទំនាក់ទំនងសាធារណៈ"]
                }
            }
        }

        default_archetype = archetypes["INTJ"]

        summary = archetypes.get(mbti_type, default_archetype)

        summary_en = dict(summary.get("en", {}))
        summary_en["role"] = summary.get("role", "Analysts")
        summary_en["role_color"] = summary.get("role_color", "#88619A")

        summary_km = dict(summary.get("km", {}))
        summary_km["role"] = summary.get("role_km", "អ្នកវិភាគ (Analysts)")
        summary_km["role_color"] = summary.get("role_color", "#88619A")

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
                traits_summary_en=summary_en,
                traits_summary_km=summary_km
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
            result.traits_summary_en = summary_en
            result.traits_summary_km = summary_km
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

