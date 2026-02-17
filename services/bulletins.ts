
import { apiClient } from '../lib/api-client';

export interface Bulletin {
    id: string;
    teacherId: string;
    title: string;
    content: string;
    category?: string;
    targetLevel?: string;
    createdAt: string;
    isRead?: boolean;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: string;
    readStats?: {
        readCount: number;
        totalCount: number;
        percentage: number;
    };
    teacher?: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}

export const bulletinsService = {
    async create(data: { title: string; content: string; category?: string; targetLevel?: string }): Promise<Bulletin> {
        return apiClient.post<Bulletin>('/bulletins', data);
    },

    async getForTeacher(): Promise<Bulletin[]> {
        return apiClient.get<Bulletin[]>('/bulletins/teacher');
    },

    async getForStudent(): Promise<Bulletin[]> {
        return apiClient.get<Bulletin[]>('/bulletins/student');
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/bulletins/${id}`);
    },

    async markAsRead(id: string): Promise<void> {
        await apiClient.post(`/bulletins/${id}/read`);
    }
};
