import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class FavoriteToggleIn(BaseModel):
    entity_type: str # "university", "major", "career", "scholarship"
    entity_id: uuid.UUID
    
    model_config = ConfigDict(extra="forbid")


class FavoriteToggleOut(BaseModel):
    entity_type: str
    entity_id: uuid.UUID
    is_favorited: bool
    
    model_config = ConfigDict(extra="ignore")


class UserFavoritesOut(BaseModel):
    universities: List[Dict[str, Any]] = []
    majors: List[Dict[str, Any]] = []
    careers: List[Dict[str, Any]] = []
    scholarships: List[Dict[str, Any]] = []
    
    model_config = ConfigDict(extra="ignore")

