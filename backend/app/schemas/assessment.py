import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


# --- PERSONALITY ---
class PersonalityOptionOut(BaseModel):
    id: uuid.UUID
    label_en: str
    label_km: str
    target_trait: str
    order_index: int
    
    model_config = ConfigDict(extra="ignore")


class PersonalityQuestionOut(BaseModel):
    id: uuid.UUID
    dimension: str
    prompt_en: str
    prompt_km: str
    order_index: int
    options: List[PersonalityOptionOut]
    
    model_config = ConfigDict(extra="ignore")


class PersonalityAnswerIn(BaseModel):
    question_id: uuid.UUID
    selected_option_id: uuid.UUID


class PersonalitySubmitIn(BaseModel):
    answers: List[PersonalityAnswerIn]
    
    model_config = ConfigDict(extra="forbid")


class PersonalityResultOut(BaseModel):
    id: uuid.UUID
    personality_type: str # e.g. "INTJ"
    extraversion_score: float
    introversion_score: float
    sensing_score: float
    intuition_score: float
    thinking_score: float
    feeling_score: float
    judging_score: float
    perceiving_score: float
    traits_summary_en: Dict[str, Any]
    traits_summary_km: Dict[str, Any]
    
    model_config = ConfigDict(extra="ignore")


# --- RIASEC ---
class RiasecQuestionOut(BaseModel):
    id: uuid.UUID
    category: str # R, I, A, S, E, C
    prompt_en: str
    prompt_km: str
    order_index: int
    
    model_config = ConfigDict(extra="ignore")


class RiasecAnswerIn(BaseModel):
    question_id: uuid.UUID
    rating: int # 1 to 5 Likert


class RiasecSubmitIn(BaseModel):
    answers: List[RiasecAnswerIn]
    
    model_config = ConfigDict(extra="forbid")


class RiasecResultOut(BaseModel):
    id: uuid.UUID
    holland_code: str # e.g. "IRE"
    realistic_score: float
    investigative_score: float
    artistic_score: float
    social_score: float
    enterprising_score: float
    conventional_score: float
    analysis_en: Dict[str, Any]
    analysis_km: Dict[str, Any]
    
    model_config = ConfigDict(extra="ignore")


# --- ACADEMIC PREFERENCES ---
class AcademicPreferencesIn(BaseModel):
    favorite_subjects: List[str] # ["Mathematics", "Informatics", "Physics"]
    strongest_subjects: List[str] # ["Mathematics", "English"]
    enjoyed_activities: List[str] # ["Coding", "Robotics", "Writing"]
    preferred_work_environments: Optional[List[str]] = None
    preferred_learning_style: Optional[str] = None
    career_interest_areas: List[str] # ["Software", "AI", "Finance"]
    preferred_locations: List[str] # ["Phnom Penh"]
    annual_tuition_budget_usd: Optional[float] = None
    requires_scholarship: bool = False
    
    model_config = ConfigDict(extra="forbid")


class AcademicPreferencesOut(AcademicPreferencesIn):
    id: uuid.UUID
    user_id: uuid.UUID
    
    model_config = ConfigDict(extra="ignore")

