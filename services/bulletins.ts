const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Bulletin {
    id: string;
    teacherId: string;
    title: string;
    content: string;
    category?: string;
    targetLevel?: string;
    createdAt: string;
    teacher?: {
        firstName: string;
        lastName: string;
    };
}

export const bulletinsService = {
    async create(data: { title: string; content: string; category?: string; targetLevel?: string }): Promise<Bulletin> {
        const response = await fetch(`${API_URL}/bulletins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Duyuru oluşturulamadı');
        return response.json();
    },

    async getForTeacher(): Promise<Bulletin[]> {
        const response = await fetch(`${API_URL}/bulletins/teacher`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('getForTeacher error:', response.status, errorText);
            throw new Error(`Duyurular yüklenemedi: ${response.status}`);
        }
        return response.json();
    },

    async getForStudent(): Promise<Bulletin[]> {
        const response = await fetch(`${API_URL}/bulletins/student`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('getForStudent error:', response.status, errorText);
            throw new Error(`Duyurular yüklenemedi: ${response.status}`);
        }
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/bulletins/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Duyuru silinemedi');
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
            console.error('[bulletinsService] Error parsing user from localStorage:', e);
            return '';
        }
    }
};
