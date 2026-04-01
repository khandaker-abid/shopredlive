const SIGNALHOUSE_API_URL = process.env.SIGNALHOUSE_API_URL || 'https://devapi.signalhouse.io';
const SIGNALHOUSE_API_KEY = process.env.SIGNALHOUSE_API_KEY || '';

class SignalHouseService {
    constructor() {
        this.apiUrl = SIGNALHOUSE_API_URL;
        this.apiKey = SIGNALHOUSE_API_KEY;
    }

    async request(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `SignalHouse API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('SignalHouse API error:', error);
            throw error;
        }
    }

    async createChannel(channelId, participants) {
        return this.request('/channels', {
            method: 'POST',
            body: JSON.stringify({
                channelId,
                participants,
                type: 'private'
            })
        });
    }

    async sendMessage(channelId, senderId, content) {
        return this.request(`/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                senderId,
                content,
                timestamp: new Date().toISOString()
            })
        });
    }

    async getMessages(channelId, options = {}) {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.before) params.append('before', options.before);

        return this.request(`/channels/${channelId}/messages?${params.toString()}`);
    }

    async getChannels(userId) {
        return this.request(`/users/${userId}/channels`);
    }

    async markAsRead(channelId, userId, messageId) {
        return this.request(`/channels/${channelId}/read`, {
            method: 'POST',
            body: JSON.stringify({
                userId,
                messageId
            })
        });
    }
}

const signalHouse = new SignalHouseService();

module.exports = { SignalHouseService, signalHouse };
