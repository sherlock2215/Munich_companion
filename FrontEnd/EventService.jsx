// EventService.jsx
import { apiService } from './apiService';

const EventService = {
    fetchPlaces: async (mood = "🎨 Art & Culture", lat, lng, radius = 10000) => {
        try {
            if (!lat || !lng) {
                throw new Error('Location required to fetch places');
            }

            const result = await apiService.getNearbyPlaces(mood, lat, lng, radius);

            // Transform the GeoJSON response to match the expected format
            if (result.features) {
                return result.features.map(feature => ({
                    type: "Feature",
                    geometry: feature.geometry,
                    properties: {
                        id: feature.properties.id,
                        name: feature.properties.name,
                        mood: mood,
                        address: feature.properties.address,
                        rating: feature.properties.rating,
                        price_level: feature.properties.price_level,
                        types: feature.properties.types || [],
                        total_ratings: feature.properties.total_ratings,
                        open_now: feature.properties.open_now,
                        "marker-color": feature.properties["marker-color"] || "#4ECDC4",
                        groups: feature.properties.groups || []
                    }
                }));
            }

            return [];
        } catch (error) {
            console.error('Error fetching places:', error);
            // Fallback to mock data if API fails
            return await EventService.getMockPlaces();
        }
    },

    // Keep mock data as fallback
    getMockPlaces: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    // Your existing mock data here as fallback
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [11.575858, 48.139972] },
                        properties: {
                            id: "1",
                            name: "Kunsthalle der Hypo-Kulturstiftung",
                            mood: "🎨 Art & Culture",
                            address: "Theatinerstraße 8, München",
                            rating: 4.6,
                            price_level: 0,
                            types: ["museum", "gallery"],
                            total_ratings: 3555,
                            open_now: true,
                            "marker-color": "#4ECDC4",
                            groups: []
                        }
                    }
                ]);
            }, 500);
        });
    }
};

export default EventService;