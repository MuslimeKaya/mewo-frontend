import { API_URL, authService } from './auth';

export const grammarService = {
    async getTopics(cefr?: string): Promise<any[]> {
        const token = authService.getToken();
        if (!token) return [];

        const url = cefr ? `${API_URL}/grammar/topics?cefr=${cefr}` : `${API_URL}/grammar/topics`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Gramer konuları yüklenemedi');
        return response.json();
    },

    async getTopicDetail(id: string): Promise<any> {
        const token = authService.getToken();
        if (!token) return null;

        const response = await fetch(`${API_URL}/grammar/topic/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Konu detayı yüklenemedi');
        return response.json();
    },

    async submitResult(topicId: string, score: number): Promise<any> {
        const token = authService.getToken();
        if (!token) return null;

        const response = await fetch(`${API_URL}/grammar/submit/${topicId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score }),
        });
        if (!response.ok) throw new Error('Sonuç kaydedilemedi');
        return response.json();
    },

    async getProgress(): Promise<any[]> {
        const token = authService.getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/grammar/progress`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('İlerleme yüklenemedi');
        return response.json();
    }
};
