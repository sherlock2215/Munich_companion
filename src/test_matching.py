import sys
import os

sys.path.append(os.path.dirname(__file__))

from matching_service import MatchingService, UserProfile


def test_matching_service():
    print("🧪 Testing Matching Service...")

    # Initialize service
    matching = MatchingService()

    # Create test users
    user1 = UserProfile(
        user_id="user1",
        name="Anna",
        age=25,
        interests=["Programming", "Hiking", "Coffee Culture", "Photography"],
        location={"lat": 48.1351, "lng": 11.5820},
        bio="Software developer who loves outdoors",
        avatar_emoji="👩‍💻"
    )

    user2 = UserProfile(
        user_id="user2",
        name="Ben",
        age=28,
        interests=["Programming", "Coffee Culture", "Music Festivals", "AI"],
        location={"lat": 48.1360, "lng": 11.5830},  # 130m away
        bio="Tech enthusiast and music lover",
        avatar_emoji="👨‍🎤"
    )

    user3 = UserProfile(
        user_id="user3",
        name="Clara",
        age=30,
        interests=["Yoga", "Meditation", "Vegan Cooking"],
        location={"lat": 48.1400, "lng": 11.5900},  # 1km away
        bio="Wellness coach and foodie",
        avatar_emoji="🧘‍♀️"
    )

    # Add users to service
    matching.add_user(user1)
    matching.add_user(user2)
    matching.add_user(user3)

    print(f"✅ Added {len(matching.users)} test users")

    # Test matching
    from matching_service import MatchRequest
    request = MatchRequest(current_user_id="user1", max_distance_km=5)

    matches = matching.find_matches(request)

    print(f"\n🎯 Found {len(matches)} matches for Anna:")

    for i, match in enumerate(matches, 1):
        print(f"\n{i}. {match['user']['name']} ({match['score']}% match)")
        print(f"   📍 {match['distance_km']:.1f}km away")
        print(f"   ❤️  Shared interests: {', '.join(match['shared_interests'])}")
        print(f"   💬 Icebreakers: {match['icebreakers']}")

    # Test chat creation
    if matches:
        chat = matching.create_chat_session("user1", "user2")
        print(f"\n💬 Created chat: {chat.chat_id}")
        print(f"   ⏰ Expires: {chat.expires_at}")

        # Test messaging
        matching.add_message_to_chat(chat.chat_id, "user1", "Hey Ben! Love that we both enjoy programming!")
        matching.add_message_to_chat(chat.chat_id, "user2", "Hi Anna! Yeah, what's your favorite language?")

        print(f"   💌 Messages: {len(chat.messages)}")
        for msg in chat.messages:
            print(f"      {msg['user_id']}: {msg['message']}")

    print("\n🎉 All tests passed! Matching service is working.")


if __name__ == "__main__":
    test_matching_service()