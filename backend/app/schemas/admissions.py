import uuid
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class EligibilityOfferingOut(BaseModel):
    id: uuid.UUID
    university_id: uuid.UUID
    university_slug: str
    university_name: Dict[str, str]
    university_acronym: Dict[str, str]
    university_logo_url: Optional[str] = None
    university_province: str
    major_id: uuid.UUID
    major_slug: str
    major_name: Dict[str, str]
    major_category: str
    major_image_url: Optional[str] = None
    degree_level: str
    duration_years: float
    tuition_annual_usd: Optional[float] = None
    language_of_instruction: str
    min_bacii_grade: Optional[str] = None
    required_subjects: Optional[List[str]] = None
    is_admission_verified: bool = False
    admission_source_url: Optional[str] = None
    admission_notes: Optional[str] = None
    status: str
    reason: str

    model_config = ConfigDict(extra="ignore")


class EligibilityOut(BaseModel):
    grade: str
    total_with_requirements: int
    eligible: List[EligibilityOfferingOut] = []
    below_requirements: List[EligibilityOfferingOut] = []
    unverified_requirements: List[EligibilityOfferingOut] = []
    missing_requirements: List[EligibilityOfferingOut] = []
    unverified_programs_count: int = 0

    model_config = ConfigDict(extra="ignore")
