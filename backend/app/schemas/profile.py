import uuid
from typing import Optional
from datetime import date
from urllib.parse import urlparse
from pydantic import BaseModel, ConfigDict, field_validator


def _validate_avatar_url(value: Optional[str]) -> Optional[str]:
    if value is None:
        return value
    value = value.strip()
    if value == "":
        return value
    if len(value) > 500:
        raise ValueError("Avatar URLs must be 500 characters or fewer.")
    if value.startswith("/") and not value.startswith("//"):
        return value
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Avatar URL must be an http(s) URL or an absolute path.")
    return value


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
    bacii_grade: Optional[str] = None
    preferred_language: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    @field_validator("bacii_grade")
    @classmethod
    def validate_bacii_grade(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return value
        value = value.strip().upper()
        if value not in {"A", "B", "C", "D", "E", "F"}:
            raise ValueError("BACII grade must be A, B, C, D, E, or F.")
        return value

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, value: Optional[str]) -> Optional[str]:
        return _validate_avatar_url(value)
    
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
    bacii_grade: Optional[str] = None
    preferred_language: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    
    model_config = ConfigDict(extra="ignore")

