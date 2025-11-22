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
    groups: List[GroupModel] = Field(default_factory=list)


locations_db: Dict[str, LocationModel] = {}

"""
user_1 = UserModel(user_id=1, name="Anna", age=25, gender="weiblich")
user_2 = UserModel(user_id=2, name="Bernd", age=28, gender="männlich")

# Erstellen einer Gruppe (mit den Usern)
test_group = GroupModel(
    group_id=101,
    title="Deutsches Museum",
    description="Wir gehen die größten Museuen in münchen durch",
    age_range=(20, 35),
    date=date.today(),
    host_id=1,
    members=[user_1, user_2]
)
#
# Erstellen der Location (mit der Gruppe)
test_location = LocationModel(
    groups=[test_group]
)

# --- 2. In das Dict speichern ---
locations_db["Deutsches Museum"] = test_location

search_key = "Deutsches Museum"
found_location = locations_db.get(search_key)

if found_location:
    # 2. NUR DIESES MODEL ZU JSON MACHEN
    # Pydantic V2 hat dafür eine direkte Funktion:
    json_output = found_location.model_dump_json(indent=4)

    print(f"JSON für '{search_key}':")
    print(json_output)

    # Falls Sie das JSON wirklich "verschicken" (z.B. API-Response),
    # ist 'json_output' jetzt der fertige String.
else:
    print("Location nicht gefunden.")
"""