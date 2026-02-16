
import { User, UserRole } from '../types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authService = {
    async getMe(token: string): Promise<User> {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const userData = await response.json();
        return { ...userData, access_token: token };
    },

    async signup(email: string, password: string, firstName: string, lastName: string, role: UserRole): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/auth/local/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName, role }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        return await response.json();
    },

    async resendVerificationOtp(email: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/auth/local/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kod tekrar gönderilemedi');
        }

        return await response.json();
    },

    async verifySignup(email: string, otp: string): Promise<User> {
        const response = await fetch(`${API_URL}/auth/local/verify-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Doğrulama başarısız');
        }

        const { access_token } = await response.json();
        return await this.getMe(access_token);
    },

    async signin(email: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/auth/local/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signin failed');
        }

        const { access_token } = await response.json();
        return await this.getMe(access_token);
    },

    async getTeachers(): Promise<any[]> {
        const token = this.getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/auth/teachers`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Öğretmenler yüklenemedi');
        return response.json();
    },

    async assignTeacher(teacherId: string, message: string = ''): Promise<void> {
        const token = this.getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/auth/assign-teacher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ teacherId, message }),
        });
        if (!response.ok) throw new Error('Öğretmen atanamadı');

        const updatedUser = await this.getMe(token);
        localStorage.setItem('mewo_user', JSON.stringify(updatedUser));
    },

    async getMyStudents(page?: number, limit?: number): Promise<{ count: number; students: any[] }> {
        const token = this.getToken();
        if (!token) return { count: 0, students: [] };

        let url = `${API_URL}/auth/my-students`;
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Öğrenci bilgileri yüklenemedi');
        return response.json();
    },

    async getJoinRequests(): Promise<any[]> {
        const token = this.getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/auth/join-requests`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Başvurular yüklenemedi');
        return response.json();
    },

    async approveRequest(id: string): Promise<void> {
        const token = this.getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/auth/approve-request/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Başvuru onaylanamadı');
    },

    async rejectRequest(id: string): Promise<void> {
        const token = this.getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/auth/reject-request/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Başvuru reddedilemedi');
    },

    async getStudentProgressForTeacher(studentId: string): Promise<any[]> {
        const token = this.getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/words/teacher/student-progress/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Öğrenci ilerlemesi yüklenemedi');
        return response.json();
    },

    async updateProfile(data: { firstName?: string; lastName?: string; bio?: string }): Promise<User> {
        const token = this.getToken();
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Profil güncellenemedi');
        const updatedUser = await response.json();
        const fullUser = { ...updatedUser, access_token: token };
        localStorage.setItem('mewo_user', JSON.stringify(fullUser));
        return fullUser;
    },

    async uploadAvatar(file: File): Promise<User> {
        const token = this.getToken();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/auth/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) throw new Error('Avatar yüklenemedi');
        const updatedUser = await response.json();
        const fullUser = { ...updatedUser, access_token: token };
        localStorage.setItem('mewo_user', JSON.stringify(fullUser));
        return fullUser;
    },

    async changePassword(data: { otp?: string; newPassword?: string }): Promise<any> {
        const token = this.getToken();
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Şifre değiştirilemedi');
        }
        return response.json();
    },

    async sendOtp(): Promise<any> {
        const token = this.getToken();
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Doğrulama kodu gönderilemedi');
        }
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
            console.error('[authService] Error parsing user from localStorage:', e);
            return '';
        }
    }
};
