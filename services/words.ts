import { apiClient, API_URL as CLIENT_API_URL } from '../lib/api-client';
import { Word } from '../types';

export const API_URL = CLIENT_API_URL || 'http://localhost:3001/api';

export type { Word };

const searchCache = new Map<string, { items: Word[], total: number }>();

export const wordsService = {
    async findAll(search?: string, level?: string, page: number = 1, limit: number = 50): Promise<{ items: Word[], total: number }> {
        const cacheKey = `${search || ''}-${level || 'all'}-${page}-${limit}`;

        if (searchCache.has(cacheKey)) {
            return searchCache.get(cacheKey)!;
        }

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (level) params.append('level', level);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const data = await apiClient.get<{ items: Word[], total: number }>(`/words?${params.toString()}`);
        searchCache.set(cacheKey, data);
        return data;
    },

    async selectWord(wordId: string): Promise<any> {
        return apiClient.post('/words/teacher/select', { wordId });
    },

    async unselectWord(wordId: string): Promise<any> {
        return apiClient.delete(`/words/teacher/select/${wordId}`);
    },

    async getMySelections(): Promise<Word[]> {
        return apiClient.get<Word[]>('/words/teacher/my-selections');
    },

    async getTeacherWords(): Promise<Word[]> {
        return apiClient.get<Word[]>('/words/teacher-words');
    },

    async sendAssignment(words: Word[], title?: string, description?: string, files?: File[], studentIds?: string[]): Promise<any> {
        const formData = new FormData();
        formData.append('words', JSON.stringify(words));
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }

        if (studentIds && studentIds.length > 0) {
            formData.append('studentIds', JSON.stringify(studentIds));
        }

        return apiClient.post('/words/teacher/assignments', formData);
    },

    async getAssignmentHistory(): Promise<any[]> {
        return apiClient.get<any[]>('/words/teacher/assignments/history');
    },

    async deleteAssignment(assignmentId: string): Promise<any> {
        await apiClient.delete(`/words/teacher/assignments/${assignmentId}`);
        return { success: true };
    },

    async getStudentAssignmentHistory(): Promise<any[]> {
        return apiClient.get<any[]>('/words/assignments/student');
    },

    async markAsViewed(assignmentId: string): Promise<void> {
        try {
            // We don't need the response body, just the action
            await apiClient.post(`/words/assignments/${assignmentId}/view`);
        } catch (e) {
            // Ignore JSON parse errors for empty 200 OK responses if that's happening
            console.error('Failed to mark assignment as viewed', e);
        }
    },

    async getQuiz(wordId: string): Promise<{ wordId: string, question: string, options: { text: string, isCorrect: boolean }[] }> {
        return apiClient.get(`/words/student/quiz/${wordId}`);
    },

    async verifyQuiz(wordId: string, isCorrect: boolean): Promise<any> {
        return apiClient.post('/words/student/quiz/verify', { wordId, isCorrect });
    },

    async getLevelExam(level: string): Promise<any> {
        return apiClient.get(`/words/student/exam/${level}`);
    },

    async submitLevelExam(level: string, answers: { wordId: string, answer: string }[]): Promise<any> {
        return apiClient.post(`/words/student/exam/${level}/submit`, { answers });
    },

    async getLearnedWords(): Promise<any[]> {
        return apiClient.get<any[]>('/words/student/learned-words');
    },

    async getStudentProgress(): Promise<{ level: string, total: number, learned: number, percentage: number }[]> {
        return apiClient.get('/words/student/progress');
    },

    async getRecommendedWords(): Promise<Word[]> {
        return apiClient.get<Word[]>('/words/student/recommended-words');
    },

    // Kept for backward compatibility if used directly
    getToken() {
        if (typeof window === 'undefined') return '';
        const userStr = localStorage.getItem('mewo_user');
        if (!userStr || userStr === 'undefined' || userStr === 'null') return '';

        try {
            const user = JSON.parse(userStr);
            if (!user) return '';
            return user.access_token || user.token || '';
        } catch (e) {
            console.error('[wordsService] Error parsing user from localStorage:', e);
            return '';
        }
    },

    clearCache() {
        searchCache.clear();
    },

    // Adding legacy authFetch for backward compatibility but redirecting to apiClient
    async authFetch(url: string, options: RequestInit = {}) {
        // We need to strip the API_URL part if it's there because apiClient expects endpoint relative
        let endpoint = url;
        const apiBase = API_URL;
        if (url.startsWith(apiBase)) {
            endpoint = url.substring(apiBase.length);
        }

        // Map fetch options to apiClient methods
        const method = options.method?.toUpperCase() || 'GET';
        if (method === 'GET') return apiClient.get(endpoint, options);
        if (method === 'POST') return apiClient.post(endpoint, options.body, options);
        if (method === 'PUT') return apiClient.put(endpoint, options.body, options);
        if (method === 'DELETE') return apiClient.delete(endpoint, options);

        return apiClient.get(endpoint, options);
    }
};
