import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.catalog import MajorSummaryOut


class MajorRecommendationOut(BaseModel):
    id: uuid.UUID
    major_id: uuid.UUID
    major: MajorSummaryOut
    match_score: float # 0 to 100
    personality_match_score: float
    riasec_match_score: float
    academic_match_score: float
    career_match_score: float
    explanation: Dict[str, Any]
    rank_position: int
    
    model_config = ConfigDict(extra="ignore")


class RecommendationGenerateIn(BaseModel):
    recompute: bool = False
    
    model_config = ConfigDict(extra="ignore")


class RecommendationRuleOut(BaseModel):
    id: uuid.UUID
    rule_name: str
    weight_personality: float
    weight_riasec: float
    weight_academic_strengths: float
    weight_career_alignment: float
    is_active: bool
    parameters: Dict[str, Any]
    
    model_config = ConfigDict(extra="ignore")

