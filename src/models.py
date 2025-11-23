import json
import uuid
from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Any, Tuple, Dict
from datetime import date, datetime


class ChatMessageModel(BaseModel):
    sender_id: int
    sender_name: str
    group_id: uuid.UUID
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)


class UserModel(BaseModel):
    user_id: int
    name: str
    age: int
    gender: str
    interests: List[str]
    bio: Optional[str]

class GroupModel(BaseModel):
    group_id: uuid.UUID
    title: str
    description: str
    age_range: Tuple[int,int]
    date: date
    host_id: int
    members: List[UserModel] = Field(default_factory=list)
    chat_history: List[ChatMessageModel] = Field(default_factory=list)

class LocationModel(BaseModel):
    location_id: str
    lat: float = 0.0
    lng: float = 0.0
    groups: Dict[uuid.UUID, GroupModel] = {}