import json
import threading
import time
import math
import googlemaps
import os
from dotenv import load_dotenv
import uuid
from time import sleep

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Any, Tuple, Dict
from datetime import date, timedelta
from models import *

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps_client = googlemaps.Client(key=GOOGLE_API_KEY)


locations_db: Dict[str, LocationModel] = {}
DB_LOCK = threading.Lock()


def run_deleter_in_background():
    deletion_thread = threading.Thread(target=timed_deleting)
    deletion_thread.daemon = True

    deletion_thread.start()
    print("Hintergrund-Löschung gestartet.")

def timed_deleting():
    while(True):
        with DB_LOCK:
            for l in locations_db.values():
                keys_to_delete = []
                for k,g in l.groups.items():
                    if g.date < date.today():
                        keys_to_delete.append(k)
                for key in keys_to_delete:
                    del l.groups[key]
        time.sleep(3600*6)


def fetch_coordinates_from_google(place_id: str) -> Tuple[float, float]:
    try:
        result = gmaps_client.place(place_id, fields=['geometry'])
        if result['status'] == 'OK':
            loc = result['result']['geometry']['location']
            return loc['lat'], loc['lng']
    except Exception as e:
        print(f"Error fetching coords for {place_id}: {e}")
    # Fallback (München Zentrum)
    return 48.137, 11.575


def delete_group(location_id:str, group_id:uuid.UUID):
    with DB_LOCK:
        if location_id not in locations_db:
            print("Location not found")
            return False
        else:
            location = locations_db[location_id]
            if group_id not in location.groups:
                print("Group not found")
                return False
            else:
                del location.groups[group_id]
                return True

def join_group(location_id: str, group_id: uuid.UUID, user: UserModel):
    with DB_LOCK:
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
    with DB_LOCK:
        if location_id in locations_db:
            location = locations_db[location_id]
            if group_id in location.groups:
                print("Something went wrong, pls try again")
                return None
            location.groups[group_id] = group
            return group
        else:
            lat, lng = fetch_coordinates_from_google(location_id)
            groups: Dict[uuid.UUID, GroupModel] = {group_id: group}
            location = LocationModel(
                location_id = location_id,
                lat = lat,
                lng = lng,
                groups = groups
            )
            locations_db[location_id] = location
            return group

def get_groups_by_location(locations : List[str]):
    json_list = []
    with DB_LOCK:
        for location in locations:
            if location in locations_db:
                current_location =  locations_db[location]
                json_output = current_location.model_dump_json(indent=4)
                json_list.append(json_output)
            #else:
                #raise ValueError(f"Location '{location}' not found!.")
    return json_list


def get_nearby_groups(user_lat: float, user_lng: float, radius_km: float = 3.0) -> List[Dict]:
    nearby_groups = []
    with DB_LOCK:
        for loc in locations_db.values():
            if loc.lat == 0.0 and loc.lng == 0.0:
                continue

            # Euklidische Distanz-Schätzung für München (1° Lat ~ 111km, 1° Lng ~ 74km), from Gemini
            lat_diff = (loc.lat - user_lat) * 111
            lng_diff = (loc.lng - user_lng) * 74
            dist_km = math.sqrt(lat_diff ** 2 + lng_diff ** 2)
            if dist_km <= radius_km:
                loc_data = loc.model_dump(mode='json')
                for group in loc.groups.values():
                    g_data = group.model_dump(mode='json')
                    g_data['location_id'] = loc.location_id
                    nearby_groups.append(g_data)
    return nearby_groups


def send_message(location_id: str, group_id: uuid.UUID, user: UserModel, content: str):
    with DB_LOCK:
        if location_id not in locations_db:
            print("Location not found")
            return None

        location = locations_db[location_id]

        if group_id not in location.groups:
            print("Group not found")
            return None

        group = location.groups[group_id]

        is_member = any(m.user_id == user.user_id for m in group.members)

        if not is_member:
            print("You cant write in chats where you arent a member! What the hell did you do????")
            return None

        new_message = ChatMessageModel(
            sender_id=user.user_id,
            sender_name=user.name,
            group_id=group.group_id,
            content=content,
            timestamp=datetime.now()
        )

        group.chat_history.append(new_message)
        print(f"Message sent by {user.name}.")
        return new_message


def get_chat_history(location_id: str, group_id: uuid.UUID, user_id: int):
    with DB_LOCK:
        if location_id not in locations_db:
            return []

        location = locations_db[location_id]
        if group_id not in location.groups:
            return []

        group = location.groups[group_id]

        is_member = any(m.user_id == user_id for m in group.members)
        if not is_member:
            print("Accesse denied: You are not a member.")
            return []

        return group.chat_history




"""
user_1 = UserModel(user_id=1, name="Anna", age=25, gender="weiblich")
user_2 = UserModel(user_id=2, name="Bernd", age=28, gender="männlich")
g = create_group("1", "Deutsches Museum", "test", (10,30), date.today(), user_1)
join_group("1", g.group_id, user_2)
g2 = create_group("2", "d", "d", (10,30), date.today()-(timedelta(days=1)), user_1)
#sleep(10)
for json in get_groups_by_location(["1","2"]):
    print(json)
send_message("1",g.group_id, user_1, "test")
li = get_chat_history("1", g.group_id, user_2.user_id)
print(li)
"""






"""
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
"""