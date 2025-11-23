// frontend/src/services/api.js

/**
 * Universelle Request-Funktion.
 * Sie prüft, ob der Endpoint mit '/users' beginnt (kein /api Prefix).
 */
async function request(endpoint, options = {}) {
    // Prüfen, ob die Route eine /users-Route ist (die keinen /api Prefix hat, z.B. /users/register)
    const isUserEndpoint = endpoint.startsWith('/users');

    // Die URL wird nur hinzugefügt, wenn es KEINE /users Route ist
    const url = (isUserEndpoint ? '' : '/api') + endpoint;

    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Wir geben den Fehler aus dem Backend (detail) zurück
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

export const ApiService = {
    // --- MAP & GROUPS ---
    getNearbyPlaces: (lat, lng, mood, radius) => {
        // Route: /api/map/nearby
        const params = new URLSearchParams({ lat, lng, mood, radius });
        return request(`/map/nearby?${params.toString()}`);
    },
    getGroupsAtLocation: (locationId) => {
        // Route: /api/locations/{id}/groups
        return request(`/locations/${locationId}/groups`);
    },

    createGroup: (locationId, groupData, hostUser) => {
        const payload = {
            location_id: locationId,
            title: groupData.title,
            description: groupData.description,
            age_range: [parseInt(groupData.minAge), parseInt(groupData.maxAge)],
            date: groupData.date,
            host: hostUser // UserModel
        };
        // Route: /api/groups/create
        return request('/groups/create', { method: 'POST', body: JSON.stringify(payload) });
    },

    joinGroup: (locationId, groupId, user) => {
        // Route: /api/groups/join
        return request('/groups/join', {
            method: 'POST',
            body: JSON.stringify({ location_id: locationId, group_id: groupId, user: user })
        });
    },

    // --- USER (Global) ---
    getUserGroups: (userId) => {
        // Route: /users/{id}/groups (KEIN /api)
        return request(`/users/${userId}/groups`);
    },

    registerUser: (userModel) => {
        // Route: /users/register
        return request('/users/register', { method: 'POST', body: JSON.stringify(userModel) });
    },

    // --- CHAT & CHATBOT ---
    getChatHistory: (locationId, groupId, userId) => {
        // Route: /api/chat/history
        const params = new URLSearchParams({ location_id: locationId, group_id: groupId, user_id: userId });
        return request(`/chat/history?${params.toString()}`);
    },
    sendChatMessage: (locationId, groupId, user, content) => {
        // Route: /api/chat/send
        return request('/chat/send', {
            method: 'POST',
            body: JSON.stringify({ location_id: locationId, group_id: groupId, user: user, content: content })
        });
    },
    askChatbot: (userInput, lat, lng) => {
        // Route: /api/chatbot/user
        const params = new URLSearchParams({ user_input: userInput, lat, lng });
        return request(`/chatbot/user?${params.toString()}`);
    }
};