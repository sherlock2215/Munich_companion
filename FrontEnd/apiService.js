// apiService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Adjust port as needed

export const apiService = {
    // Get nearby places based on mood and location
    async getNearbyPlaces(mood, lat, lng, radius = 10000) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/map/nearby?lat=${lat}&lng=${lng}&mood=${encodeURIComponent(mood)}&radius=${radius}`
            );
            if (!response.ok) throw new Error('Failed to fetch places');
            return await response.json();
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            throw error;
        }
    },

    // Get groups at a specific location
    async getGroupsAtLocation(locationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/locations/${locationId}/groups`);
            if (!response.ok) throw new Error('Failed to fetch groups');
            return await response.json();
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    },

    // Create a new group
    async createGroup(groupData) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groupData),
            });
            if (!response.ok) throw new Error('Failed to create group');
            return await response.json();
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    // Join a group
    async joinGroup(joinData) {
        try {
            const response = await fetch(`${API_BASE_URL}/groups/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(joinData),
            });
            if (!response.ok) throw new Error('Failed to join group');
            return await response.json();
        } catch (error) {
            console.error('Error joining group:', error);
            throw error;
        }
    },

    // Send chat message
    async sendMessage(messageData) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });
            if (!response.ok) throw new Error('Failed to send message');
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Get chat history
    async getChatHistory(locationId, groupId, userId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/chat/history?location_id=${locationId}&group_id=${groupId}&user_id=${userId}`
            );
            if (!response.ok) throw new Error('Failed to fetch chat history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    },

    // Chatbot user interaction
    async chatWithBot(userInput, lat, lng) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/chatbot/user?user_input=${encodeURIComponent(userInput)}&lat=${lat}&lng=${lng}`
            );
            if (!response.ok) throw new Error('Failed to get chatbot response');
            return await response.json();
        } catch (error) {
            console.error('Error with chatbot:', error);
            throw error;
        }
    },

    // Get automatic chatbot suggestions
    async getAutomaticSuggestions(lat, lng) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/chatbot/automatic?lat=${lat}&lng=${lng}`
            );
            if (!response.ok) throw new Error('Failed to get automatic suggestions');
            return await response.json();
        } catch (error) {
            console.error('Error with automatic suggestions:', error);
            throw error;
        }
    }
};