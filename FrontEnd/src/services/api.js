// src/services/api.js
const API_BASE = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

class UserService extends ApiService {
  async register(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: userData,
    });
  }

  async getAll() {
    return this.request('/users/all');
  }

  async getUserGroups(userId) {
    return this.request(`/users/${userId}/groups`);
  }
}

class GroupService extends ApiService {
  async create(groupData) {
    return this.request('/groups/create', {
      method: 'POST',
      body: groupData,
    });
  }

  async join(joinData) {
    return this.request('/groups/join', {
      method: 'POST',
      body: joinData,
    });
  }

  async getByLocation(locationId) {
    return this.request(`/locations/${locationId}/groups`);
  }

  async getNearby(lat, lng, radius = 4000) {
    return this.request(`/map/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }
}

class ChatService extends ApiService {
  async sendMessage(messageData) {
    return this.request('/chat/send', {
      method: 'POST',
      body: messageData,
    });
  }

  async getHistory(locationId, groupId, userId) {
    return this.request(`/chat/history?location_id=${locationId}&group_id=${groupId}&user_id=${userId}`);
  }
}

class ChatbotService extends ApiService {
  async ask(userInput, lat, lng) {
    return this.request(`/chatbot/user?user_input=${encodeURIComponent(userInput)}&lat=${lat}&lng=${lng}`);
  }

  async getAutomated(lat, lng) {
    return this.request(`/chatbot/automatic?lat=${lat}&lng=${lng}`);
  }
}

class MatchingService extends ApiService {
  async addUserProfile(profile) {
    return this.request('/api/matching/add-user', {
      method: 'POST',
      body: profile,
    });
  }

  async findMatches(request) {
    return this.request('/api/matching/find-matches', {
      method: 'POST',
      body: request,
    });
  }

  async createChat(user1Id, user2Id) {
    return this.request('/api/matching/create-chat', {
      method: 'POST',
      body: { user1_id: user1Id, user2_id: user2Id },
    });
  }

  async getInterests() {
    return this.request('/api/matching/interests');
  }
}

export const userService = new UserService();
export const groupService = new GroupService();
export const chatService = new ChatService();
export const chatbotService = new ChatbotService();
export const matchingService = new MatchingService();