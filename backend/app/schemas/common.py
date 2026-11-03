from typing import Generic, TypeVar, Optional, Any, Dict, List
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class LocalizedText(BaseModel):
    en: str
    km: Optional[str] = None
    
    model_config = ConfigDict(extra="ignore")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    meta: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(extra="ignore")


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20
    
    model_config = ConfigDict(extra="ignore")

