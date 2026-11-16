import uuid
from datetime import date
from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


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
    created_at: str
    updated_at: str

    model_config = ConfigDict(extra="ignore")
