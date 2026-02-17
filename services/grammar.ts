import { apiClient } from '../lib/api-client';

export const grammarService = {
    async getTopics(cefr?: string): Promise<any[]> {
        const url = cefr ? `/grammar/topics?cefr=${cefr}` : '/grammar/topics';
        return apiClient.get<any[]>(url);
    },

    async getTopicDetail(id: string): Promise<any> {
        return apiClient.get<any>(`/grammar/topic/${id}`);
    },

    async submitResult(topicId: string, score: number): Promise<any> {
        return apiClient.post(`/grammar/submit/${topicId}`, { score });
    },

    async getProgress(): Promise<any[]> {
        return apiClient.get<any[]>('/grammar/progress');
    }
};
