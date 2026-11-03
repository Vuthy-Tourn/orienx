import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class AdminAnalyticsOut(BaseModel):
    total_students: int
    total_universities: int
    total_majors: int
    total_careers: int
    total_scholarships: int
    completed_personality_assessments: int
    completed_riasec_assessments: int
    generated_recommendations_count: int
    popular_majors: List[Dict[str, Any]]
    popular_universities: List[Dict[str, Any]]
    
    model_config = ConfigDict(extra="ignore")


class UserManagementOut(BaseModel):
    id: uuid.UUID
    email: str
    status: str
    roles: List[str]
    full_name_en: Optional[str] = None
    province: Optional[str] = None
    created_at: str
    
    model_config = ConfigDict(extra="ignore")


class RuleUpdateIn(BaseModel):
    weight_personality: Optional[float] = None
    weight_riasec: Optional[float] = None
    weight_academic_strengths: Optional[float] = None
    weight_career_alignment: Optional[float] = None
    is_active: Optional[bool] = None
    parameters: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(extra="forbid")

