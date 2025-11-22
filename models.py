import json
from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Any, Tuple, Dict
from datetime import date


class UserModel(BaseModel):
    user_id: int
    name: str
    age: int
    gender: str

class GroupModel(BaseModel):
    group_id: int
    title: str
    description: str
    age_range: Tuple[int,int]
    date: date
    host_id: int
    members: List[UserModel] = Field(default_factory=list)

class LocationModel(BaseModel):
    location_id: str
    groups: Dict[int, GroupModel] = {}