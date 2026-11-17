import uuid
from datetime import date
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


DOCUMENT_TYPES = (
    "TRANSCRIPT",
    "BACII_CERTIFICATE",
    "NATIONAL_ID",
    "PHOTOS",
    "APPLICATION_FORM",
    "ESSAY",
    "RECOMMENDATION",
    "FEE_RECEIPT",
    "ENGLISH_TEST",
    "PORTFOLIO",
    "OTHER",
)

PLAN_STATUSES = (
    "RESEARCHING",
    "PREPARING",
    "SUBMITTED",
    "INTERVIEW",
    "ACCEPTED",
    "WAITLISTED",
    "REJECTED",
)


class ApplicationPlanCreateIn(BaseModel):
    kind: Literal["UNIVERSITY", "SCHOLARSHIP"]
    target_id: uuid.UUID
    status: Literal[
        "RESEARCHING",
        "PREPARING",
        "SUBMITTED",
        "INTERVIEW",
        "ACCEPTED",
        "WAITLISTED",
        "REJECTED",
    ] = "RESEARCHING"
    deadline: Optional[date] = None
    reminder_days: int = Field(default=7, ge=0, le=90)
    notes: Optional[str] = Field(default=None, max_length=2000)
    next_action: Optional[str] = Field(default=None, max_length=255)

    model_config = ConfigDict(extra="forbid")


class ApplicationPlanUpdateIn(BaseModel):
    status: Optional[
        Literal[
            "RESEARCHING",
            "PREPARING",
            "SUBMITTED",
            "INTERVIEW",
            "ACCEPTED",
            "WAITLISTED",
            "REJECTED",
        ]
    ] = None
    deadline: Optional[date] = None
    reminder_days: Optional[int] = Field(default=None, ge=0, le=90)
    notes: Optional[str] = Field(default=None, max_length=2000)
    next_action: Optional[str] = Field(default=None, max_length=255)

    model_config = ConfigDict(extra="forbid")


class ApplicationPlanDocumentCreateIn(BaseModel):
    document_type: Literal[
        "TRANSCRIPT",
        "BACII_CERTIFICATE",
        "NATIONAL_ID",
        "PHOTOS",
        "APPLICATION_FORM",
        "ESSAY",
        "RECOMMENDATION",
        "FEE_RECEIPT",
        "ENGLISH_TEST",
        "PORTFOLIO",
        "OTHER",
    ] = "OTHER"
    name_en: Optional[str] = Field(default=None, max_length=120)
    name_km: Optional[str] = Field(default=None, max_length=120)
    is_required: bool = True
    due_date: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=1000)

    model_config = ConfigDict(extra="forbid")


class ApplicationPlanDocumentUpdateIn(BaseModel):
    name_en: Optional[str] = Field(default=None, max_length=120)
    name_km: Optional[str] = Field(default=None, max_length=120)
    is_required: Optional[bool] = None
    is_completed: Optional[bool] = None
    due_date: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=1000)

    model_config = ConfigDict(extra="forbid")


class ApplicationPlanDocumentOut(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    document_type: str
    name_en: str
    name_km: Optional[str] = None
    is_required: bool = True
    is_completed: bool = False
    completed_at: Optional[str] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    sort_order: int = 0

    model_config = ConfigDict(extra="ignore")


class ApplicationPlanOut(BaseModel):
    id: uuid.UUID
    kind: str
    target_id: uuid.UUID
    target_title: Dict[str, Any]
    target_subtitle: Optional[str] = None
    target_slug: Optional[str] = None
    target_image_url: Optional[str] = None
    target_url: Optional[str] = None
    status: str
    deadline: Optional[date] = None
    reminder_days: int = 7
    notes: Optional[str] = None
    next_action: Optional[str] = None
    documents: List[ApplicationPlanDocumentOut] = []
    documents_total: int = 0
    documents_completed: int = 0
    required_documents_total: int = 0
    required_documents_completed: int = 0
    next_document_due_date: Optional[date] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(extra="ignore")
