import uuid
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name_en: str
    full_name_km: Optional[str] = None
    province: str = "Phnom Penh"
    current_education_level: str = "GRADE_12" # GRADE_10, GRADE_11, GRADE_12, HIGH_SCHOOL_GRADUATE, UNIVERSITY_STUDENT
    high_school: Optional[str] = None
    graduation_year: Optional[int] = 2026
    preferred_language: str = "km"
    
    model_config = ConfigDict(extra="forbid")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = True
    
    model_config = ConfigDict(extra="forbid")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(extra="forbid")


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=255)
    new_password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(extra="forbid")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user_id: uuid.UUID
    email: str
    role: str
    
    model_config = ConfigDict(extra="ignore")


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    status: str
    is_email_verified: bool
    roles: List[str]
    full_name_en: Optional[str] = None
    full_name_km: Optional[str] = None
    province: Optional[str] = None
    current_education_level: Optional[str] = None
    preferred_language: Optional[str] = "km"
    
    model_config = ConfigDict(extra="ignore")

