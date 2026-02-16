import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/bulletins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Duyuru oluşturulamadı');
        return response.json();
    },

    async getForTeacher(): Promise<Bulletin[]> {
        const token = authService.getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/bulletins/teacher`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('getForTeacher error:', response.status, errorText);
            if (response.status === 401) return [];
            throw new Error(`Duyurular yüklenemedi: ${response.status}`);
        }
        return response.json();
    },

    async getForStudent(): Promise<Bulletin[]> {
        const token = authService.getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/bulletins/student`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('getForStudent error:', response.status, errorText);
            if (response.status === 401) return [];
            throw new Error(`Duyurular yüklenemedi: ${response.status}`);
        }
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/bulletins/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Duyuru silinemedi');
    },

    async markAsRead(id: string): Promise<void> {
        const token = authService.getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/bulletins/${id}/read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Duyuru okundu olarak işaretlenemedi');
    }
};
