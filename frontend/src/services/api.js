// frontend/src/services/api.js

const BASE_URL = '/api'; // Backend erwartet jetzt /api prefix

async function request(endpoint, options = {}) {
    const url = BASE_URL + endpoint;
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Fehler: ${response.statusText}`);
    }
    return response.json();
}

export const ApiService = {
    // Map
    getNearbyPlaces: (lat, lng, mood, radius) => {
        const params = new URLSearchParams({ lat, lng, mood, radius });
        return request(`/map/nearby?${params.toString()}`);
    },

    // Gruppen für einen Ort laden
    getGroupsAtLocation: (locationId) => {
        return request(`/locations/${locationId}/groups`);
    },

    // Gruppe erstellen
    // Matches CreateGroupRequest in main.py
    createGroup: (locationId, groupData, hostUser) => {
        const payload = {
            location_id: locationId,
            title: groupData.title,
            description: groupData.description,
            age_range: [parseInt(groupData.minAge), parseInt(groupData.maxAge)], // Tuple als Array
            date: groupData.date, // String "YYYY-MM-DD"
            host: hostUser // Muss komplettes UserModel sein
        };
        return request('/groups/create', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // Gruppe beitreten
    joinGroup: (locationId, groupId, user) => {
        return request('/groups/join', {
            method: 'POST',
            body: JSON.stringify({
                location_id: locationId,
                group_id: groupId,
                user: user
            })
        });
    },

    // Chatverlauf laden
    getChatHistory: (locationId, groupId, userId) => {
        const params = new URLSearchParams({ location_id: locationId, group_id: groupId, user_id: userId });
        return request(`/chat/history?${params.toString()}`);
    },

    // Nachricht senden (REST Fallback)
    sendChatMessage: (locationId, groupId, user, content) => {
        return request('/chat/send', {
            method: 'POST',
            body: JSON.stringify({
                location_id: locationId,
                group_id: groupId,
                user: user,
                content: content
            })
        });
    }
};