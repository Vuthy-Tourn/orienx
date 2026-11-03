import uuid
from typing import Optional
from datetime import date
from pydantic import BaseModel, ConfigDict


class StudentProfileUpdate(BaseModel):
    full_name_en: Optional[str] = None
    full_name_km: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    province: Optional[str] = None
    high_school: Optional[str] = None
    current_education_level: Optional[str] = None
    graduation_year: Optional[int] = None
    preferred_language: Optional[str] = None
    bio: Optional[str] = None
    
    model_config = ConfigDict(extra="forbid")


class StudentProfileOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name_en: str
    full_name_km: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    province: str
    high_school: Optional[str] = None
    current_education_level: str
    graduation_year: Optional[int] = None
    preferred_language: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    
    model_config = ConfigDict(extra="ignore")

