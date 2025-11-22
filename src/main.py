from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.models import *
from mood_service import DirectMoodMapper
from src import GroupDataManager as db


class CreateGroupRequest(BaseModel):
    location_id: str
    title: str
    description: str
    age_range: Tuple[int, int]
    date: date
    host: UserModel

class JoinGroupRequest(BaseModel):
    location_id: str
    group_id: uuid.UUID
    user: UserModel

class SendMessageRequest(BaseModel):
    location_id: str
    group_id: uuid.UUID
    user: UserModel
    content: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting API")
    db.run_deleter_in_background()
    yield
    print("Shutting down API")


app = FastAPI(title="MunichCompanion API", lifespan=lifespan)


origins = [
    "http://localhost:5173",  # Standard Vite Port
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


mood_mapper = DirectMoodMapper()


@app.get("/map/nearby")
def get_places_nearby(
        lat: float,
        lng: float,
        mood: str = "🎨 Art & Culture",
        radius: int = 10000
):
    try:
        result = mood_mapper.find_places(mood,lat, lng, radius)
        return result
    except Exception as e:
        print(f"Error in mood_mapper: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/locations/{location_id}/groups")
def get_groups_at_location(location_id: str):
    try:
        json_strings_list = db.get_groups_by_location([location_id])
        parsed_groups = []
        for json_str in json_strings_list:
            try:
                parsed_groups.append(json.loads(json_str))
            except json.JSONDecodeError:
                continue
        return parsed_groups
    except ValueError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/groups/create")
def create_new_group(req: CreateGroupRequest):
    try:
        result = db.create_group(location_id=req.location_id, title= req.title, description= req.description, age_range=req.age_range, gdate=req.date, host= req.host)
        if result is None:
            raise HTTPException(status_code=400, detail="Group creation failed (Possible Duplicate ID, just try again)")
        else:
            return {"status": "success", "message": "Group created successfully"}
    except Exception as e:
        print(f"Error creating group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/groups/join")
def join_existing_group(req: JoinGroupRequest):
    success = db.join_group(location_id=req.location_id, group_id=req.group_id, user=req.user)
    if not success:
        raise HTTPException(status_code=400, detail="Could not join group. (Age restriction, or Group not found)")
    else:
        return {"status": "success", "message": "Joined group successfully"}

@app.post("/chat/send")
def send_chat_message(req: SendMessageRequest):
    success = db.send_message(location_id=req.location_id, group_id=req.group_id, user=req.user, content=req.content)
    if not success:
        raise HTTPException(status_code=403, detail="Could not send message. User might not be in the group.")
    else:
        return {"status": "success", "message": "Message sent"}

@app.get("/chat/history")
def get_chat_history(location_id: str, group_id: uuid.UUID, user_id: int):
    history = db.get_chat_history(location_id, group_id, user_id)
    return history
