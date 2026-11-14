import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from typing import Literal
from datetime import date


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
    registrations_by_month: List[Dict[str, Any]] = []
    assessments_by_month: List[Dict[str, Any]] = []
    recommendations_by_month: List[Dict[str, Any]] = []
    users_by_role: List[Dict[str, Any]] = []

    model_config = ConfigDict(extra="ignore")


class UserManagementOut(BaseModel):
    id: uuid.UUID
    email: str
    status: str
    roles: List[str]
    full_name_en: Optional[str] = None
    full_name_km: Optional[str] = None
    province: Optional[str] = None
    is_email_verified: bool = False
    last_login_at: Optional[str] = None
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



class UserStatusUpdateIn(BaseModel):
    status: Literal["ACTIVE", "SUSPENDED", "PENDING"]

    model_config = ConfigDict(extra="forbid")


class UserRolesUpdateIn(BaseModel):
    roles: List[Literal["STUDENT", "ADMIN", "SUPER_ADMIN"]]

    model_config = ConfigDict(extra="forbid")


class UniversityAdminIn(BaseModel):
    slug: Optional[str] = None
    name_en: Optional[str] = None
    name_km: Optional[str] = None
    acronym_en: Optional[str] = None
    acronym_km: Optional[str] = None
    description_en: Optional[str] = None
    description_km: Optional[str] = None
    university_type: Optional[Literal["PUBLIC", "PRIVATE"]] = None
    province: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    established_year: Optional[int] = None
    tuition_range_min_usd: Optional[float] = None
    tuition_range_max_usd: Optional[float] = None
    is_tuition_verified: Optional[bool] = None
    is_verified: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class MajorAdminIn(BaseModel):
    slug: Optional[str] = None
    name_en: Optional[str] = None
    name_km: Optional[str] = None
    category: Optional[str] = None
    description_en: Optional[str] = None
    description_km: Optional[str] = None
    riasec_primary: Optional[str] = None
    riasec_secondary: Optional[str] = None
    personality_affinity: Optional[str] = None
    is_stem: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class CareerAdminIn(BaseModel):
    slug: Optional[str] = None
    title_en: Optional[str] = None
    title_km: Optional[str] = None
    industry: Optional[str] = None
    description_en: Optional[str] = None
    description_km: Optional[str] = None
    education_level: Optional[str] = None
    riasec_code: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ScholarshipAdminIn(BaseModel):
    slug: Optional[str] = None
    title_en: Optional[str] = None
    title_km: Optional[str] = None
    provider_en: Optional[str] = None
    provider_km: Optional[str] = None
    description_en: Optional[str] = None
    description_km: Optional[str] = None
    coverage_type: Optional[Literal["FULL_TUITION", "PARTIAL_TUITION", "STIPEND_ONLY", "FULL_RIDE"]] = None
    coverage_percentage: Optional[int] = None
    country_or_institution: Optional[str] = None
    application_deadline: Optional[date] = None
    official_url: Optional[str] = None
    source_name: Optional[str] = None
    is_verified: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")
