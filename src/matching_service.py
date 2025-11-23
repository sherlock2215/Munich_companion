from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import math
import json

# ==========================================
# INTEREST TAXONOMY DATA
# ==========================================

INTEREST_CATEGORIES = {
    "🎮 Gaming & Tech": [
        "Puzzle Games", "Game Modeling & Customization", "Card Games", "Competitive Gaming",
        "Speedrunning", "Programming", "Web Development", "App Development", "Robotics", "AI",
        "VR & AR", "Video Game Development", "Blockchain & Crypto", "Gadgets & Electronics",
        "Space Exploration", "Home Automation & Smart Devices", "3D Printing", "Cybersecurity",
        "Ethical Hacking", "Data Science & Analytics", "Video Games", "Mobile Games", "eSports",
        "Board Games", "Fantasy Sports", "VR Gaming", "Game Streaming", "Tabletop RPGs",
        "Strategy Games", "Retro Gaming"
    ],
    "🍽️ Food & Drink": [
        "Cooking & Baking", "Mixology", "Vegan & Plant-Based Cooking", "Food Blogging",
        "Coffee & Espresso Culture", "Street Food", "International Cuisine", "Wine Tasting",
        "Cheese Tasting", "Fermentation", "Craft Beer & Brewing", "Tea Culture",
        "Desserts & Pastry Arts", "BBQ & Grilling", "Food Styling & Photography"
    ],
    "⚽ Sports & Fitness": [
        "Running & Jogging", "Skating", "CrossFit", "Yoga", "Hiking", "Pilates",
        "Surfing & Water Sports", "Skiing & Snowboarding", "Workouts & Weightlifting",
        "Soccer/Football", "Swimming", "Basketball", "Cycling", "Tennis", "Rock Climbing",
        "Martial Arts"
    ],
    "🌲 Outdoor & Adventure": [
        "Camping", "Wildlife Photography", "Kayaking & Canoeing", "Fishing", "Sailing & Boating",
        "Mountaineering", "Geocaching", "Scuba Diving", "Horseback Riding", "Bird Watching",
        "Hunting", "Stargazing", "Foraging"
    ],
    "✈️ Travel & Exploration": [
        "Adventure Travel", "Backpacking", "Road Trips", "Cultural Immersion", "City Tours",
        "Off-the-Beaten-Path Destinations", "Volunteering Abroad", "Ecotourism", "Travel Hacking",
        "Historical Sites & Landmarks", "Travel Writing & Blogging", "Language Learning",
        "Travel Photography", "Cruises", "Luxury Travel", "Pick Up the Local Language",
        "Listen to Live Music", "Shop at Local Markets", "Sample Local Cocktails",
        "Find Cool Coworking Spaces", "Find the Best Hiking Trails", "Join Walking Tours",
        "Practise My Photography Skills", "Go on Day Trips", "Walk Everywhere", "Visit Museums",
        "Spot Local Wildlife", "Check Out the Churches", "Try a New Activity"
    ],
    "🎨 Arts & Culture": [
        "Photography", "Graphic Design", "Street Art & Graffiti", "Crafting", "Dance",
        "Painting", "Drawing & Sketching", "Sculpture", "Architecture", "Calligraphy",
        "Art History", "Theater & Acting", "Film & Cinematography", "Opera",
        "Poetry & Creative Writing"
    ],
    "📚 Literature & Reading": [
        "Comics & Graphic Novels", "Manga & Anime", "Fiction", "Non-Fiction", "Audiobooks"
    ],
    "🎵 Music": [
        "Playing Instruments", "Hip-Hop & Rap", "Rock & Metal", "Electronic Music",
        "Music Festivals", "D.J.ing", "Collecting Vinyl", "Songwriting", "Music Production",
        "Classical Music", "Jazz", "World Music & Cultural Sounds", "Music History & Theory",
        "Musical Theater", "Singing"
    ],
    "🌍 Social Causes & Activism": [
        "Mental Health Advocacy", "Education Reform", "Environmental Activism",
        "Human Rights Advocacy", "LGBTQ+ Advocacy", "Gender Equality", "Animal Rights",
        "Climate Change Awareness", "Volunteering", "Racial Equality", "Political Activism",
        "Philanthropy & Charity Work", "Fair Trade"
    ]
}

# Flatten all interests for easy access
ALL_INTERESTS = []
for category_interests in INTEREST_CATEGORIES.values():
    ALL_INTERESTS.extend(category_interests)


# ==========================================
# DATA MODELS
# ==========================================

class UserProfile(BaseModel):
    user_id: str
    name: str
    age: int
    interests: List[str]
    location: Dict[str, float]  # {lat: 48.1351, lng: 11.5820}
    bio: Optional[str] = ""


class MatchRequest(BaseModel):
    current_user_id: str
    max_distance_km: int = 10
    min_match_score: int = 20


class ChatSession(BaseModel):
    chat_id: str
    users: List[str]  # user_ids
    shared_interests: List[str]
    created_at: datetime
    expires_at: datetime
    messages: List[Dict] = []
    status: str = "active"  # active, expired, completed


class IcebreakerRequest(BaseModel):
    shared_interests: List[str]
    count: int = 3


# ==========================================
# MATCHING SERVICE
# ==========================================

class MatchingService:
    def __init__(self):
        self.users: Dict[str, UserProfile] = {}
        self.chat_sessions: Dict[str, ChatSession] = {}
        self.icebreaker_templates = self._load_icebreaker_templates()

    def add_user(self, user: UserProfile):
        """Add or update user profile"""
        # Validate interests
        valid_interests = [interest for interest in user.interests if interest in ALL_INTERESTS]
        user.interests = valid_interests
        self.users[user.user_id] = user

    def find_matches(self, request: MatchRequest) -> List[Dict]:
        """Find potential matches for a user"""
        current_user = self.users.get(request.current_user_id)
        if not current_user:
            return []

        matches = []
        for user_id, user in self.users.items():
            if user_id == request.current_user_id:
                continue

            # Calculate distance
            distance = self._calculate_distance(current_user.location, user.location)
            if distance > request.max_distance_km:
                continue

            # Calculate match score
            match_data = self._calculate_match_score(current_user, user, distance)

            if match_data["score"] >= request.min_match_score:
                matches.append({
                    "user": {
                        "user_id": user.user_id,
                        "name": user.name,
                        "age": user.age,
                        "bio": user.bio,
                        "avatar_emoji": user.avatar_emoji,
                        "interests": user.interests
                    },
                    "score": match_data["score"],
                    "distance_km": distance,
                    "shared_interests": match_data["shared_interests"],
                    "shared_categories": match_data["shared_categories"],
                    "icebreakers": self._generate_icebreakers(match_data["shared_interests"])
                })

        # Sort by match score (highest first)
        return sorted(matches, key=lambda x: x["score"], reverse=True)

    def create_chat_session(self, user1_id: str, user2_id: str) -> Optional[ChatSession]:
        """Create a 24-hour chat session between two users"""
        user1 = self.users.get(user1_id)
        user2 = self.users.get(user2_id)

        if not user1 or not user2:
            return None

        shared_interests = list(set(user1.interests) & set(user2.interests))

        chat_session = ChatSession(
            chat_id=f"chat_{datetime.now().timestamp()}",
            users=[user1_id, user2_id],
            shared_interests=shared_interests,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=24)
        )

        self.chat_sessions[chat_session.chat_id] = chat_session
        return chat_session

    def get_chat_session(self, chat_id: str) -> Optional[ChatSession]:
        """Get chat session by ID"""
        return self.chat_sessions.get(chat_id)

    def add_message_to_chat(self, chat_id: str, user_id: str, message: str) -> bool:
        """Add message to chat session"""
        chat = self.chat_sessions.get(chat_id)
        if not chat or chat.status != "active":
            return False

        chat.messages.append({
            "user_id": user_id,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
        return True

    def _calculate_distance(self, loc1: Dict, loc2: Dict) -> float:
        """Calculate distance between two coordinates in km"""
        lat1, lon1 = loc1["lat"], loc1["lng"]
        lat2, lon2 = loc2["lat"], loc2["lng"]

        # Haversine formula
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) * math.sin(dlon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _calculate_match_score(self, user1: UserProfile, user2: UserProfile, distance: float) -> Dict:
        """Calculate comprehensive match score"""
        # Exact interest matches
        shared_interests = list(set(user1.interests) & set(user2.interests))
        exact_match_score = len(shared_interests) * 10

        # Category matches
        user1_categories = self._get_user_categories(user1.interests)
        user2_categories = self._get_user_categories(user2.interests)
        shared_categories = list(user1_categories & user2_categories)
        category_match_score = len(shared_categories) * 5

        # Distance score (closer = better)
        distance_score = max(0, 10 - distance) * 2

        # Complementary interests
        complementary_score = self._calculate_complementary_score(user1.interests, user2.interests)

        total_score = exact_match_score + category_match_score + distance_score + complementary_score

        return {
            "score": total_score,
            "shared_interests": shared_interests,
            "shared_categories": shared_categories
        }

    def _get_user_categories(self, interests: List[str]) -> set:
        """Get categories for user's interests"""
        categories = set()
        for interest in interests:
            for category, category_interests in INTEREST_CATEGORIES.items():
                if interest in category_interests:
                    categories.add(category)
        return categories

    def _calculate_complementary_score(self, interests1: List[str], interests2: List[str]) -> int:
        """Score for complementary interest pairs"""
        complementary_pairs = [
            ("Cooking & Baking", "Wine Tasting"),
            ("Hiking", "Wildlife Photography"),
            ("Programming", "AI"),
            ("Music Festivals", "Travel Photography"),
            ("Coffee & Espresso Culture", "Reading"),
            ("Yoga", "Meditation"),
            ("Photography", "Travel")
        ]

        score = 0
        for pair in complementary_pairs:
            if (pair[0] in interests1 and pair[1] in interests2) or \
                    (pair[1] in interests1 and pair[0] in interests2):
                score += 3
        return score

    def _load_icebreaker_templates(self) -> Dict[str, List[str]]:
        """Load icebreaker questions for each interest"""
        return {
            "Programming": [
                "What's your favorite programming language to work with?",
                "Working on any cool coding projects right now?",
                "Want to pair program on something fun?"
            ],
            "Hiking": [
                "Know any beautiful hiking trails around Munich?",
                "What's the most memorable hike you've ever done?",
                "Want to explore some trails together this weekend?"
            ],
            "Coffee & Espresso Culture": [
                "What's your go-to coffee order?",
                "Know any hidden gem cafés in the city?",
                "Want to check out a new coffee spot together?"
            ],
            "Music Festivals": [
                "What's the best music festival experience you've had?",
                "Any festivals on your must-see list this year?",
                "What type of festival vibe do you prefer - big or intimate?"
            ],
            "Photography": [
                "What do you love photographing most - people, nature, or urban scenes?",
                "Want to go on a photo walk together sometime?",
                "Digital or film photography - which do you prefer?"
            ],
            "Travel Photography": [
                "What's the most photogenic place you've visited?",
                "Do you prefer landscape photography or street photography when traveling?",
                "Want to explore some photogenic spots in Munich?"
            ],
            "Cooking & Baking": [
                "What's your signature dish that always impresses people?",
                "Have you tried any of Munich's cooking classes?",
                "What cuisine would you love to learn more about?"
            ]
        }

    def _generate_icebreakers(self, shared_interests: List[str]) -> List[str]:
        """Generate icebreaker questions based on shared interests"""
        icebreakers = []
        for interest in shared_interests[:3]:  # Top 3 shared interests
            if interest in self.icebreaker_templates:
                icebreakers.extend(self.icebreaker_templates[interest][:1])

        # Fill with general icebreakers if needed
        general_icebreakers = [
            "What brought you to Munich?",
            "What's your favorite way to spend a weekend here?",
            "Any hidden gems in the city you'd recommend?"
        ]

        while len(icebreakers) < 3 and general_icebreakers:
            icebreakers.append(general_icebreakers.pop(0))

        return icebreakers[:3]


# ==========================================
# FASTAPI ROUTES (to add to main.py)
# ==========================================

"""
# Add these imports to main.py:
from matching_service import MatchingService, UserProfile, MatchRequest, ChatSession

# Initialize matching service
matching_service = MatchingService()

# Add these routes to main.py:

@app.post("/api/matching/add-user")
async def add_user_profile(user: UserProfile):
    matching_service.add_user(user)
    return {"status": "success", "message": "User profile added"}

@app.post("/api/matching/find-matches")
async def find_matches(request: MatchRequest):
    matches = matching_service.find_matches(request)
    return {"matches": matches}

@app.post("/api/matching/create-chat")
async def create_chat(user1_id: str, user2_id: str):
    chat_session = matching_service.create_chat_session(user1_id, user2_id)
    if chat_session:
        return chat_session
    raise HTTPException(status_code=400, detail="Could not create chat session")

@app.get("/api/matching/chat/{chat_id}")
async def get_chat(chat_id: str):
    chat = matching_service.get_chat_session(chat_id)
    if chat:
        return chat
    raise HTTPException(status_code=404, detail="Chat not found")

@app.post("/api/matching/chat/{chat_id}/message")
async def send_message(chat_id: str, user_id: str, message: str):
    success = matching_service.add_message_to_chat(chat_id, user_id, message)
    if success:
        return {"status": "success"}
    raise HTTPException(status_code=400, detail="Could not send message")

@app.get("/api/matching/interests")
async def get_all_interests():
    return INTEREST_CATEGORIES
"""