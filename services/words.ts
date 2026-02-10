import { User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Word {
    id: string;
    en: string;
    tr: string;
    definition?: string;
    pos?: string;
    cefr?: string;
    example?: string;
    teachers?: { id: string; firstName: string; lastName: string }[];
}

const searchCache = new Map<string, { items: Word[], total: number }>();

export const wordsService = {
    async authFetch(url: string, options: RequestInit = {}) {
        const token = this.getToken();
        if (!token) {
            console.warn(`[wordsService] No token found for request to: ${url}`);
            throw new Error('Oturum anahtarı bulunamadı. Lütfen tekrar giriş yapın.');
        }

        const headers: any = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            let errorDetail = '';
            try {
                const data = await response.json();
                errorDetail = data.message || JSON.stringify(data);
            } catch (e) {
                errorDetail = await response.text().catch(() => 'No detail available');
            }


            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('mewo_user');
                    window.location.reload();
                }
                throw new Error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
            }
            if (response.status === 403) throw new Error('Bu işlem için yetkiniz bulunmuyor.');

            throw new Error(errorDetail || `İşlem başarısız (Hata: ${response.status})`);
        }

        return response;
    },

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

        const response = await this.authFetch(`${API_URL}/words?${params.toString()}`);
        const data = await response.json();
        searchCache.set(cacheKey, data);
        return data;
    },

    async selectWord(wordId: string): Promise<any> {
        const response = await this.authFetch(`${API_URL}/words/teacher/select`, {
            method: 'POST',
            body: JSON.stringify({ wordId })
        });
        return response.json();
    },

    async unselectWord(wordId: string): Promise<any> {
        const response = await this.authFetch(`${API_URL}/words/teacher/select/${wordId}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async getMySelections(): Promise<Word[]> {
        const response = await this.authFetch(`${API_URL}/words/teacher/my-selections`);
        return response.json();
    },

    async getTeacherWords(): Promise<Word[]> {
        const response = await this.authFetch(`${API_URL}/words/teacher-words`);
        return response.json();
    },

    async sendAssignment(words: Word[], title?: string, description?: string, files?: File[]): Promise<any> {
        const formData = new FormData();
        formData.append('words', JSON.stringify(words));
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }

        const response = await this.authFetch(`${API_URL}/words/teacher/assignments`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    },

    async getAssignmentHistory(): Promise<any[]> {
        const response = await this.authFetch(`${API_URL}/words/teacher/assignments/history`);
        return response.json();
    },

    async deleteAssignment(assignmentId: string): Promise<any> {
        const response = await this.authFetch(`${API_URL}/words/teacher/assignments/${assignmentId}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async getStudentAssignmentHistory(): Promise<any[]> {
        const response = await this.authFetch(`${API_URL}/words/assignments/student`);
        return response.json();
    },

    async markAsViewed(assignmentId: string): Promise<void> {
        try {
            await this.authFetch(`${API_URL}/words/assignments/${assignmentId}/view`, {
                method: 'POST'
            });
        } catch (e) {
            console.error('Failed to mark assignment as viewed', e);
        }
    },

    async getQuiz(wordId: string): Promise<{ wordId: string, question: string, options: { text: string, isCorrect: boolean }[] }> {
        const response = await this.authFetch(`${API_URL}/words/student/quiz/${wordId}`);
        return response.json();
    },

    async verifyQuiz(wordId: string, isCorrect: boolean): Promise<any> {
        const response = await this.authFetch(`${API_URL}/words/student/quiz/verify`, {
            method: 'POST',
            body: JSON.stringify({ wordId, isCorrect })
        });
        return response.json();
    },

    async getLevelExam(level: string): Promise<any> {
        const response = await this.authFetch(`${API_URL}/words/student/exam/${level}`);
        return response.json();
    },

    async submitLevelExam(level: string, answers: { wordId: string, answer: string }[]): Promise<any> {
        const response = await this.authFetch(`${API_URL}/words/student/exam/${level}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers })
        });
        return response.json();
    },

    async getLearnedWords(): Promise<any[]> {
        const response = await this.authFetch(`${API_URL}/words/student/learned-words`);
        return response.json();
    },

    async getStudentProgress(): Promise<{ level: string, total: number, learned: number, percentage: number }[]> {
        const response = await this.authFetch(`${API_URL}/words/student/progress`);
        return response.json();
    },

    async getRecommendedWords(): Promise<Word[]> {
        const response = await this.authFetch(`${API_URL}/words/student/recommended-words`);
        return response.json();
    },

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
    }
};
