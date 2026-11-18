import uuid
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class AdvisorQuestionIn(BaseModel):
    question: str = Field(min_length=2, max_length=800)
    language: Literal["en", "km"] = "en"

    model_config = ConfigDict(extra="ignore")


class AdvisorSourceOut(BaseModel):
    type: str
    id: str
    title_en: str
    title_km: str
    url: str
    snippet_en: str
    snippet_km: str

    model_config = ConfigDict(extra="ignore")


class AdvisorAnswerOut(BaseModel):
    interaction_id: uuid.UUID
    answer: str
    mode: Literal["local_model", "retrieval_only"]
    model_name: Optional[str] = None
    sources: List[AdvisorSourceOut]
    suggested_questions: List[str]
    latency_ms: int
    tools_used: List[str] = []

    model_config = ConfigDict(extra="ignore")


class AdvisorStatusOut(BaseModel):
    enabled: bool
    model_connected: bool
    model_name: Optional[str] = None
    mode: Literal["local_model", "retrieval_only"]
    setup_command: str

    model_config = ConfigDict(extra="ignore")


class AdvisorFeedbackIn(BaseModel):
    is_helpful: bool

    model_config = ConfigDict(extra="ignore")
