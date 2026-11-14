import uuid
from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import BaseModel, ConfigDict


class ScholarshipSummaryOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: Dict[str, str]
    provider: Dict[str, str]
    description: Dict[str, str]
    coverage_type: str
    coverage_percentage: Optional[int] = None
    country_or_institution: str
    application_deadline: Optional[date] = None
    official_url: str
    source_name: Optional[str] = None
    last_verified_at: Optional[date] = None
    poster_url: Optional[str] = None
    is_verified: bool
    
    model_config = ConfigDict(extra="ignore")


class ScholarshipDetailOut(ScholarshipSummaryOut):
    eligibility_criteria: Dict[str, Any]
    academic_requirements: Optional[Dict[str, Any]] = None
    application_process: Dict[str, Any]
    user_status: Optional[str] = None # SAVED, APPLIED, WON


class ScholarshipTrackIn(BaseModel):
    status: str # SAVED, PLANNING_TO_APPLY, APPLIED, WON, REJECTED
    notes: Optional[str] = None
    
    model_config = ConfigDict(extra="forbid")

