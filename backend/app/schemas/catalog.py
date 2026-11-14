import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.common import LocalizedText


class UniversitySummaryOut(BaseModel):
    id: uuid.UUID
    slug: str
    name: Dict[str, str]
    acronym: Dict[str, str]
    description: Dict[str, str]
    university_type: str
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    province: str
    website_url: str
    tuition_range_min_usd: Optional[float] = None
    tuition_range_max_usd: Optional[float] = None
    is_tuition_verified: bool
    is_verified: bool
    majors_count: Optional[int] = 0
    
    model_config = ConfigDict(extra="ignore")


class UniversityOfferingOut(BaseModel):
    major_id: uuid.UUID
    major_slug: str
    major_name: Dict[str, str]
    major_category: str
    major_image_url: Optional[str] = None
    degree_level: str
    duration_years: float
    tuition_annual_usd: Optional[float] = None
    is_tuition_verified: bool
    language_of_instruction: str
    
    model_config = ConfigDict(extra="ignore")


class UniversityDetailOut(UniversitySummaryOut):
    address: Dict[str, str]
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    established_year: Optional[int] = None
    admission_requirements: Optional[Any] = None
    facilities: Optional[Any] = None
    scholarship_summary: Optional[Any] = None
    offerings: List[UniversityOfferingOut] = []


class CareerSummaryOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: Dict[str, str]
    industry: str
    description: Dict[str, str]
    education_level: str
    riasec_code: str
    
    model_config = ConfigDict(extra="ignore")


class CareerDetailOut(CareerSummaryOut):
    responsibilities: List[str]
    required_skills: List[str]
    work_environments: List[str]
    career_progression: List[str]
    related_majors: List[Dict[str, Any]] = []


class MajorOfferingUniversityOut(BaseModel):
    university_id: uuid.UUID
    university_slug: str
    university_name: Dict[str, str]
    university_acronym: Dict[str, str]
    university_type: str
    province: str
    tuition_annual_usd: Optional[float] = None
    is_tuition_verified: bool
    duration_years: float = 4.0
    degree_level: str = "BACHELOR"
    logo_url: Optional[str] = None
    
    model_config = ConfigDict(extra="ignore")


class MajorSummaryOut(BaseModel):
    id: uuid.UUID
    slug: str
    name: Dict[str, str]
    category: str
    description: Dict[str, str]
    riasec_primary: str
    riasec_secondary: str
    personality_affinity: Optional[str] = None
    image_url: Optional[str] = None
    is_stem: bool
    universities_count: Optional[int] = 0
    min_tuition_usd: Optional[float] = None
    offering_universities: Optional[List[MajorOfferingUniversityOut]] = []
    
    model_config = ConfigDict(extra="ignore")


class MajorDetailOut(MajorSummaryOut):
    subjects_studied: List[str]
    required_skills: List[str]
    potential_challenges: List[str]
    universities: List[MajorOfferingUniversityOut] = []
    careers: List[CareerSummaryOut] = []


class UniversityCompareOut(BaseModel):
    universities: List[UniversityDetailOut]

