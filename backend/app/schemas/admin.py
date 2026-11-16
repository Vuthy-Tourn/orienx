import uuid
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from typing import Literal
from datetime import date


def _validate_image_source(value: Optional[str]) -> Optional[str]:
    if value is None:
        return value
    value = value.strip()
    if value == "":
        return value
    if len(value) > 500:
        raise ValueError("Image URLs must be 500 characters or fewer.")
    if value.startswith("/") and not value.startswith("//"):
        return value
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Image URL must be an http(s) URL or an absolute path.")
    return value


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


class UserAdminCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name_en: str = Field(min_length=1, max_length=150)
    full_name_km: Optional[str] = Field(default=None, max_length=150)
    province: str = Field(default="Phnom Penh", max_length=100)
    status: Literal["ACTIVE", "SUSPENDED", "PENDING"] = "ACTIVE"
    roles: List[Literal["STUDENT", "ADMIN", "SUPER_ADMIN"]] = Field(
        default_factory=lambda: ["STUDENT"]
    )
    is_email_verified: bool = True
    current_education_level: str = "GRADE_12"
    preferred_language: Literal["km", "en"] = "km"

    model_config = ConfigDict(extra="forbid")


class UserAdminUpdateIn(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    full_name_en: Optional[str] = Field(default=None, min_length=1, max_length=150)
    full_name_km: Optional[str] = Field(default=None, max_length=150)
    province: Optional[str] = Field(default=None, max_length=100)
    status: Optional[Literal["ACTIVE", "SUSPENDED", "PENDING"]] = None
    roles: Optional[List[Literal["STUDENT", "ADMIN", "SUPER_ADMIN"]]] = None
    is_email_verified: Optional[bool] = None
    current_education_level: Optional[str] = None
    preferred_language: Optional[Literal["km", "en"]] = None

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
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    established_year: Optional[int] = None
    tuition_range_min_usd: Optional[float] = None
    tuition_range_max_usd: Optional[float] = None
    is_tuition_verified: Optional[bool] = None
    is_verified: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("logo_url", "cover_image_url")
    @classmethod
    def validate_image_urls(cls, value: Optional[str]) -> Optional[str]:
        return _validate_image_source(value)

    @field_validator("established_year")
    @classmethod
    def validate_established_year(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and not 1900 <= value <= 2100:
            raise ValueError("Established year must be between 1900 and 2100.")
        return value

    @field_validator("tuition_range_min_usd", "tuition_range_max_usd")
    @classmethod
    def validate_tuition(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value < 0:
            raise ValueError("Tuition values cannot be negative.")
        return value

    @model_validator(mode="after")
    def validate_tuition_order(self):
        if (
            self.tuition_range_min_usd is not None
            and self.tuition_range_max_usd is not None
            and self.tuition_range_max_usd < self.tuition_range_min_usd
        ):
            raise ValueError("Max tuition must be at least min tuition.")
        return self


class PersonalityOptionAdminIn(BaseModel):
    id: Optional[uuid.UUID] = None
    label_en: str
    label_km: str
    target_trait: Literal["E", "I", "S", "N", "T", "F", "J", "P"]
    weight: float = 1.0
    order_index: int = 0

    model_config = ConfigDict(extra="forbid")

    @field_validator("weight")
    @classmethod
    def validate_weight(cls, value: float) -> float:
        if value <= 0 or value > 10:
            raise ValueError("Weight must be between 0 and 10.")
        return value


class PersonalityQuestionAdminIn(BaseModel):
    dimension: Literal["EI", "SN", "TF", "JP"]
    prompt_en: str
    prompt_km: str
    order_index: Optional[int] = None
    is_active: bool = True
    options: List[PersonalityOptionAdminIn]

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def validate_options(self):
        if len(self.options) < 2:
            raise ValueError("A personality question needs at least two options.")
        expected = {
            "EI": {"E", "I"},
            "SN": {"S", "N"},
            "TF": {"T", "F"},
            "JP": {"J", "P"},
        }[self.dimension]
        traits = {option.target_trait for option in self.options}
        if not expected.issubset(traits):
            raise ValueError(
                f"Options for {self.dimension} must cover {', '.join(sorted(expected))}."
            )
        return self


class PersonalityQuestionUpdateIn(BaseModel):
    dimension: Optional[Literal["EI", "SN", "TF", "JP"]] = None
    prompt_en: Optional[str] = None
    prompt_km: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None
    options: Optional[List[PersonalityOptionAdminIn]] = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def validate_options(self):
        if self.options is None:
            return self
        if len(self.options) < 2:
            raise ValueError("A personality question needs at least two options.")
        dimension = self.dimension
        if dimension:
            expected = {
                "EI": {"E", "I"},
                "SN": {"S", "N"},
                "TF": {"T", "F"},
                "JP": {"J", "P"},
            }[dimension]
            if not expected.issubset({o.target_trait for o in self.options}):
                raise ValueError(
                    f"Options for {dimension} must cover {', '.join(sorted(expected))}."
                )
        return self


class RiasecQuestionAdminIn(BaseModel):
    category: Literal["R", "I", "A", "S", "E", "C"]
    prompt_en: str
    prompt_km: str
    order_index: Optional[int] = None
    is_active: bool = True

    model_config = ConfigDict(extra="forbid")


class RiasecQuestionUpdateIn(BaseModel):
    category: Optional[Literal["R", "I", "A", "S", "E", "C"]] = None
    prompt_en: Optional[str] = None
    prompt_km: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class UniversityOfferingCreateIn(BaseModel):
    university_id: uuid.UUID
    major_id: uuid.UUID
    faculty_id: Optional[uuid.UUID] = None
    degree_level: Literal["ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE"] = "BACHELOR"
    duration_years: float = 4.0
    tuition_annual_usd: Optional[float] = None
    is_tuition_verified: bool = False
    language_of_instruction: Literal["ENGLISH", "KHMER", "BILINGUAL", "FRENCH"] = "BILINGUAL"
    official_curriculum_url: Optional[str] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("duration_years")
    @classmethod
    def validate_duration(cls, value: float) -> float:
        if value < 0.5 or value > 10:
            raise ValueError("Duration must be between 0.5 and 10 years.")
        return value

    @field_validator("tuition_annual_usd")
    @classmethod
    def validate_offering_tuition(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value < 0:
            raise ValueError("Tuition cannot be negative.")
        return value

    @field_validator("official_curriculum_url")
    @classmethod
    def validate_curriculum_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value.strip() == "":
            return value
        parsed = urlparse(value)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("Curriculum URL must be an http(s) URL.")
        return value


class UniversityOfferingUpdateIn(BaseModel):
    university_id: Optional[uuid.UUID] = None
    major_id: Optional[uuid.UUID] = None
    faculty_id: Optional[uuid.UUID] = None
    degree_level: Optional[Literal["ASSOCIATE", "BACHELOR", "MASTER", "DOCTORATE"]] = None
    duration_years: Optional[float] = None
    tuition_annual_usd: Optional[float] = None
    is_tuition_verified: Optional[bool] = None
    language_of_instruction: Optional[Literal["ENGLISH", "KHMER", "BILINGUAL", "FRENCH"]] = None
    official_curriculum_url: Optional[str] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("duration_years")
    @classmethod
    def validate_duration(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and (value < 0.5 or value > 10):
            raise ValueError("Duration must be between 0.5 and 10 years.")
        return value

    @field_validator("tuition_annual_usd")
    @classmethod
    def validate_offering_tuition(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value < 0:
            raise ValueError("Tuition cannot be negative.")
        return value

    @field_validator("official_curriculum_url")
    @classmethod
    def validate_curriculum_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value.strip() == "":
            return value
        parsed = urlparse(value)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("Curriculum URL must be an http(s) URL.")
        return value


class MajorAdminIn(BaseModel):
    slug: Optional[str] = None
    name_en: Optional[str] = None
    name_km: Optional[str] = None
    category: Optional[str] = None
    description_en: Optional[str] = None
    description_km: Optional[str] = None
    image_url: Optional[str] = None
    riasec_primary: Optional[str] = None
    riasec_secondary: Optional[str] = None
    personality_affinity: Optional[str] = None
    is_stem: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: Optional[str]) -> Optional[str]:
        return _validate_image_source(value)


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
    poster_url: Optional[str] = None
    is_verified: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("poster_url")
    @classmethod
    def validate_poster_url(cls, value: Optional[str]) -> Optional[str]:
        return _validate_image_source(value)

    @field_validator("coverage_percentage")
    @classmethod
    def validate_coverage_percentage(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and not 0 <= value <= 100:
            raise ValueError("Coverage percentage must be between 0 and 100.")
        return value
