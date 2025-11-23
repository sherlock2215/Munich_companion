// frontend/src/services/api.js

/**
 * Universal request function.
 * Checks if the endpoint starts with '/users' (no /api prefix) or requires '/api'.
 */
async function request(endpoint, options = {}) {
    // If the endpoint starts with /users, we do NOT prepend /api (e.g., /users/register)
    const isUserEndpoint = endpoint.startsWith('/users');

    // Determine the final URL prefix
    const url = (isUserEndpoint ? '' : '/api') + endpoint;

    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

export const ApiService = {
    // --- MAP & GROUPS ---
    getNearbyPlaces: (lat, lng, mood, radius) => {
        const params = new URLSearchParams({ lat, lng, mood, radius });
        return request(`/map/nearby?${params.toString()}`);
    },
    getGroupsAtLocation: (locationId) => {
        return request(`/locations/${locationId}/groups`);
    },
    createGroup: (locationId, groupData, hostUser) => {
        const payload = {
            location_id: locationId,
            title: groupData.title,
            description: groupData.description,
            age_range: [parseInt(groupData.minAge), parseInt(groupData.maxAge)],
            date: groupData.date,
            host: hostUser
        };
        return request('/groups/create', { method: 'POST', body: JSON.stringify(payload) });
    },
    joinGroup: (locationId, groupId, user) => {
        return request('/groups/join', {
            method: 'POST',
            body: JSON.stringify({ location_id: locationId, group_id: groupId, user: user })
        });
    },

    // --- USER (Global - No /api prefix) ---
    getUserGroups: (userId) => {
        // Calls /users/{id}/groups
        return request(`/users/${userId}/groups`);
    },
    registerUser: (userModel) => {
        // Calls /users/register
        return request('/users/register', { method: 'POST', body: JSON.stringify(userModel) });
    },

    // --- CHAT & CHATBOT ---
    getChatHistory: (locationId, groupId, userId) => {
        const params = new URLSearchParams({ location_id: locationId, group_id: groupId, user_id: userId });
        return request(`/chat/history?${params.toString()}`);
    },
    sendChatMessage: (locationId, groupId, user, content) => {
        return request('/chat/send', {
            method: 'POST',
            body: JSON.stringify({ location_id: locationId, group_id: groupId, user: user, content: content })
        });
    },
    askChatbot: (userInput, lat, lng) => {
        const params = new URLSearchParams({ user_input: userInput, lat, lng });
        return request(`/chatbot/user?${params.toString()}`);
    }
};