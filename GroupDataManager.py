import json
import uuid

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Any, Tuple, Dict
from datetime import date
from models import UserModel, GroupModel, LocationModel


locations_db: Dict[str, LocationModel] = {}


def join_group(location_id: str, group_id: uuid.UUID, user: UserModel):
    if location_id in locations_db:
        location = locations_db[location_id]
        groups = location.groups
        if group_id in groups:
            group = groups[group_id]
            min_age, max_age = group.age_range
            if min_age <= user.age <= max_age:
                if any(m.user_id == user.user_id for m in group.members):
                    print("You cant join a Group twice")
                    return False
                else:
                    group.members.append(user)
                    return True
            else:
                print("You dont fit the age restrictions of this Group")
                return False
        else:
            print("Group was not found at the location")
            return False
    else:
        print("this location doesnt have any groups yet")
        return False


def create_group(location_id: str, title: str, description: str, age_range: Tuple[int,int], gdate: date, host: UserModel):
    group_id = uuid.uuid4()
    group = GroupModel(
        group_id = group_id,
        title = title,
        description= description,
        age_range= age_range,
        date= gdate,
        host_id= host.user_id,
        members=[host]
    )
    if location_id in locations_db:
        location = locations_db[location_id]
        if group_id in location.groups:
            print("Something went wrong, pls try again")
            return False
        location.groups[group_id] = group
        return True
    else:
        groups: Dict[uuid.UUID, GroupModel] = {}
        location = LocationModel(
            location_id = location_id,
            groups = groups
        )
        locations_db[location_id] = location
        return True


def get_groups_by_location(locations : List[str]):
    json_list = []
    for location in locations:
        if location in locations_db:
            current_location =  locations_db[location]
            json_output = current_location.model_dump_json(indent=4)
            json_list.append(json_output)
        else:
            raise ValueError(f"Location '{location}' not found!.")
    return json_list









user_1 = UserModel(user_id=1, name="Anna", age=25, gender="weiblich")
user_2 = UserModel(user_id=2, name="Bernd", age=28, gender="männlich")

# Erstellen einer Gruppe (mit den Usern)
test_group1 = GroupModel(
    group_id=101,
    title="Deutsches Museum",
    description="Wir gehen die größten Museuen in münchen durch",
    age_range=(20, 35),
    date=date.today(),
    host_id=1,
    members=[user_1, user_2]
)
test_group2 = GroupModel(
    group_id=102,
    title="Deutsches",
    description="Wir gehen die größten Museuen in münchen durch",
    age_range=(20, 35),
    date=date.today(),
    host_id=1,
    members=[user_1, user_2]
)
test_group3 = GroupModel(
    group_id=103,
    title="Museum",
    description="Wir gehen die größten Museuen in münchen durch",
    age_range=(20, 35),
    date=date.today(),
    host_id=1,
    members=[user_1, user_2]
)
#
# Erstellen der Location (mit der Gruppe)
test_location1 = LocationModel(
    location_id="1",
    groups={
        101: test_group1,
        102: test_group2
    }
)

test_location2 = LocationModel(
    location_id="2",
    groups={
        103: test_group3
    }
)

# --- 2. In das Dict speichern ---
locations_db["3241"] = test_location1
locations_db["Kino"] = test_location2


get_groups_by_location(["3241", "Kino"])