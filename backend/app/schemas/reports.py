import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


ReportSection = Literal[
    "profile",
    "assessments",
    "recommendations",
    "plans",
    "eligibility",
]


class ReportShareCreateIn(BaseModel):
    audience: Literal["PARENT", "COUNSELOR", "OTHER"] = "PARENT"
    language: Literal["en", "km"] = "en"
    expires_in_days: int = Field(default=30, ge=1, le=365)
    sections: List[ReportSection] = Field(
        default_factory=lambda: [
            "profile",
            "assessments",
            "recommendations",
            "plans",
            "eligibility",
        ],
        min_length=1,
    )
    note: Optional[str] = Field(default=None, max_length=1000)

    model_config = ConfigDict(extra="forbid")


class ReportShareOut(BaseModel):
    id: uuid.UUID
    token: str
    url: str
    audience: str
    language: str
    sections: List[str]
    note: Optional[str] = None
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    view_count: int = 0
    last_viewed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(extra="ignore")


class SharedReportOut(BaseModel):
    token: str
    audience: str
    language: str
    note: Optional[str] = None
    generated_at: str
    expires_at: str
    student: Dict[str, Any]
    assessments: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    plans: Optional[List[Dict[str, Any]]] = None
    eligibility: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(extra="ignore")
