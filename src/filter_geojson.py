import json
import sys
from typing import List, Dict


def filter_geojson(input_file: str, selected_ids: List[str], output_file: str = None) -> Dict:
    """
    Filters GeoJSON to only include user-selected places

    Args:
        input_file: Path to original GeoJSON file
        selected_ids: List of place IDs user selected
        output_file: Optional output file path

    Returns:
        Filtered GeoJSON as dictionary
    """

    # Read original GeoJSON
    with open(input_file, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)

    # Filter features - keep user location + selected places
    filtered_features = []

    for feature in geojson_data.get("features", []):
        properties = feature.get("properties", {})
        feature_id = properties.get("id")

        # Always keep user location
        if feature_id == "user_location":
            filtered_features.append(feature)
        # Keep selected places
        elif feature_id in selected_ids:
            filtered_features.append(feature)

    # Create filtered GeoJSON
    filtered_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            **geojson_data.get("metadata", {}),
            "selected_places_count": len(filtered_features) - 1,  # Exclude user location
            "original_places_count": len(geojson_data.get("features", [])) - 1,
            "filtered_at": "user_selection"
        },
        "features": filtered_features
    }

    # Save to file if output path provided
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(filtered_geojson, f, indent=2, ensure_ascii=False)
        print(f"✅ Filtered GeoJSON saved to: {output_file}")

    return filtered_geojson


def filter_from_command_line():
    """Command line interface for filtering"""
    if len(sys.argv) < 3:
        print("Usage: python filter_geojson.py <input.geojson> <selected_id1,selected_id2,...> [output.geojson]")
        print("\nExample:")
        print(
            'python filter_geojson.py munich_art.geojson "ChIJ12nAjO51nkcRt8DRlE8kWIE,ChIJY1pEIIZ1nkcRnw7gckgsvk8" selected_art.geojson')
        return

    input_file = sys.argv[1]
    selected_ids = sys.argv[2].split(',')
    output_file = sys.argv[3] if len(sys.argv) > 3 else None

    result = filter_geojson(input_file, selected_ids, output_file)

    # Print result
    print(
        f"🎯 Filtered {result['metadata']['selected_places_count']} selected places from {result['metadata']['original_places_count']} total")
    print("Selected places:")
    for feature in result["features"]:
        if feature["properties"]["id"] != "user_location":
            print(f"  • {feature['properties']['name']}")


# Alternative: Interactive selection
def interactive_filter(input_file: str) -> Dict:
    """Let user select places interactively from terminal"""

    with open(input_file, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)

    places = []
    for feature in geojson_data["features"]:
        if feature["properties"]["id"] != "user_location":
            places.append({
                "id": feature["properties"]["id"],
                "name": feature["properties"]["name"],
                "rating": feature["properties"].get("rating", 0),
                "address": feature["properties"].get("address", "")
            })

    # Display places with numbers
    print("🎯 Available Places:")
    for i, place in enumerate(places, 1):
        print(f"{i}. {place['name']} ⭐ {place['rating']}")
        print(f"   📍 {place['address']}")
        print(f"   🔑 ID: {place['id']}")
        print()

    # Get user selection
    selected_nums = input("Enter the numbers of places you want to visit (e.g., 1,3,5): ")
    selected_indices = [int(x.strip()) - 1 for x in selected_nums.split(',')]

    selected_ids = [places[i]["id"] for i in selected_indices]

    return filter_geojson(input_file, selected_ids, f"selected_{input_file}")


if __name__ == "__main__":
    # If no arguments, run interactive mode
    if len(sys.argv) == 1:
        input_file = input("Enter GeoJSON file path: ")
        interactive_filter(input_file)
    else:
        filter_from_command_line()