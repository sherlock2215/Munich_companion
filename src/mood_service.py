import googlemaps
import os
from dotenv import load_dotenv
import json
from typing import List, Dict
import sys
from datetime import datetime

load_dotenv()


class DirectMoodMapper:
    def __init__(self):
        self.gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))

    def find_places(self, mood: str, lat: float, lng: float, radius: int = 20000) -> Dict:
        """Find places and return as GeoJSON for maps"""

        mood_configs = {
            "🎉 Party / Pub Crawl": {'types': ['bar', 'night_club'], 'keywords': 'pub nightclub'},
            "🎨 Art & Culture": {'types': ['museum', 'art_gallery'], 'keywords': 'art exhibition'},
            "🏛️ History": {'types': ['museum', 'city_hall'], 'keywords': 'history museum'},
            "🌿 Nature / Relax": {'types': ['park', 'zoo'], 'keywords': 'nature park'},
            "🍽️ Food Tour": {'types': ['restaurant', 'cafe'], 'keywords': 'food restaurant'},
            "⚽ Sports & Activities": {'types': ['stadium', 'gym'], 'keywords': 'sports activity'},
            "👨‍👨‍👧 Family Friendly": {'types': ['amusement_park', 'zoo'], 'keywords': 'family kids'},
            "💫 Hidden Gems": {'types': [], 'keywords': 'unique local hidden'}
        }

        config = mood_configs.get(mood, {})

        try:
            print(f"🔍 Searching for {mood} places near ({lat}, {lng}) within {radius}m radius...")

            places_result = self.gmaps.places_nearby(
                location=(lat, lng),
                radius=radius,
                type=config.get('types', [''])[0] if config.get('types') else None,
                keyword=config.get('keywords', '')
            )

            # Convert to GeoJSON
            geojson = self._create_geojson(places_result.get('results', []), mood, lat, lng, radius)

            return geojson

        except Exception as e:
            return {"error": str(e), "type": "FeatureCollection", "features": []}

    def _create_geojson(self, places: List, mood: str, user_lat: float, user_lng: float, radius: int) -> Dict:
        """Convert Places API results to GeoJSON format"""

        features = []

        # Add user location as first feature
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [user_lng, user_lat]
            },
            "properties": {
                "id": "user_location",
                "name": "Your Location",
                "type": "user",
                "mood": mood,
                "marker-color": "#FF0000",
                "marker-symbol": "circle"
            }
        })

        # Add each place as a feature
        for place in places:
            location = place['geometry']['location']
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [location['lng'], location['lat']]
                },
                "properties": {
                    "id": place['place_id'],
                    "name": place['name'],
                    "mood": mood,
                    "address": place.get('vicinity', ''),
                    "rating": place.get('rating', 0),
                    "price_level": place.get('price_level', 0),
                    "types": place.get('types', []),
                    "total_ratings": place.get('user_ratings_total', 0),
                    "open_now": place.get('opening_hours', {}).get('open_now', False),
                    "marker-color": self._get_marker_color(mood),
                    "marker-symbol": self._get_marker_symbol(mood)
                }
            })

        return {
            "type": "FeatureCollection",
            "metadata": {
                "mood": mood,
                "user_location": {"lat": user_lat, "lng": user_lng},
                "search_radius_meters": radius,
                "places_found": len(features) - 1,
                "total_estimated_time": (len(features) - 1) * 45,
                "budget_estimate": self._calculate_budget(places),
                "generated_at": datetime.now().isoformat()
            },
            "features": features
        }

    def _get_marker_color(self, mood: str) -> str:
        colors = {
            "🎉 Party / Pub Crawl": "#FF6B6B",
            "🎨 Art & Culture": "#4ECDC4",
            "🏛️ History": "#45B7D1",
            "🌿 Nature / Relax": "#96CEB4",
            "🍽️ Food Tour": "#FFEAA7",
            "⚽ Sports & Activities": "#DDA0DD",
            "👨‍👨‍👧 Family Friendly": "#98D8C8",
            "💫 Hidden Gems": "#F7DC6F"
        }
        return colors.get(mood, "#586A6A")

    def _get_marker_symbol(self, mood: str) -> str:
        symbols = {
            "🎉 Party / Pub Crawl": "bar",
            "🎨 Art & Culture": "art-gallery",
            "🏛️ History": "museum",
            "🌿 Nature / Relax": "park",
            "🍽️ Food Tour": "restaurant",
            "⚽ Sports & Activities": "stadium",
            "👨‍👨‍👧 Family Friendly": "amusement-park",
            "💫 Hidden Gems": "star"
        }
        return symbols.get(mood, "marker")

    def _calculate_budget(self, places: List[Dict]) -> Dict:
        if not places:
            return {"low": 0, "high": 0, "currency": "USD"}
        avg_price = sum(p.get('price_level', 2) for p in places) / len(places)
        return {
            "low": int(len(places) * avg_price * 5),
            "high": int(len(places) * avg_price * 15),
            "currency": "USD"
        }


def save_geojson_to_file(geojson_data, filename=None):
    """Save GeoJSON to a file"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        mood = geojson_data.get('metadata', {}).get('mood', 'unknown').replace(' ', '_').replace('/', '_')
        filename = f"munich_{mood}_{timestamp}.geojson"

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=2, ensure_ascii=False)

    print(f"✅ GeoJSON saved to: {filename}")
    return filename


# USAGE
if __name__ == "__main__":
    mapper = DirectMoodMapper()

    # Get user input from command line or use defaults
    if len(sys.argv) >= 4:
        mood = sys.argv[1]
        lat = float(sys.argv[2])
        lng = float(sys.argv[3])
        radius = int(sys.argv[4]) if len(sys.argv) >= 5 else 20000
    else:
        # Default to Munich center if no args provided
        mood = "🎨 Art & Culture"
        lat = 48.1351
        lng = 11.5820
        radius = 20000

    # Generate GeoJSON
    result = mapper.find_places(mood, lat, lng, radius)

    # Save to file
    filename = save_geojson_to_file(result)

    # Also print to console
    print(json.dumps(result, indent=2, ensure_ascii=False))