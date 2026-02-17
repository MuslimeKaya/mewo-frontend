import { apiClient, API_URL as CLIENT_API_URL } from '../lib/api-client';
import { User, UserRole } from '../types';

export const API_URL = CLIENT_API_URL;

export const authService = {
    async getMe(token: string): Promise<User> {
        // Explicitly pass token to override local storage check in apiClient
        const userData = await apiClient.get<User>('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return { ...userData, access_token: token };

    },

    async signup(email: string, password: string, firstName: string, lastName: string, role: UserRole): Promise<{ message: string }> {
        return apiClient.post('/auth/local/signup', { email, password, firstName, lastName, role });
    },

    async resendVerificationOtp(email: string): Promise<{ message: string }> {
        return apiClient.post('/auth/local/resend-otp', { email });
    },

    async verifySignup(email: string, otp: string): Promise<User> {
        const { access_token } = await apiClient.post<{ access_token: string }>('/auth/local/verify-signup', { email, otp });
        return await this.getMe(access_token);
    },

    async signin(email: string, password: string): Promise<User> {
        const { access_token } = await apiClient.post<{ access_token: string }>('/auth/local/signin', { email, password });
        return await this.getMe(access_token);
    },

    async getTeachers(): Promise<any[]> {
        return apiClient.get('/auth/teachers');
    },

    async assignTeacher(teacherId: string, message: string = ''): Promise<void> {
        await apiClient.post('/auth/assign-teacher', { teacherId, message });

        // Update local user data since enrollments changed
        const token = this.getToken();
        if (token) {
            const updatedUser = await this.getMe(token);
            localStorage.setItem('mewo_user', JSON.stringify(updatedUser)); // Keep local storage logic for now
        }
    },

    async getMyStudents(page?: number, limit?: number): Promise<{ count: number; students: any[] }> {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get(`/auth/my-students${queryString}`);
    },

    async getJoinRequests(): Promise<any[]> {
        return apiClient.get('/auth/join-requests');
    },

    async approveRequest(id: string): Promise<void> {
        return apiClient.post(`/auth/approve-request/${id}`);
    },

    async rejectRequest(id: string): Promise<void> {
        return apiClient.post(`/auth/reject-request/${id}`);
    },

    async getStudentProgressForTeacher(studentId: string): Promise<any[]> {
        return apiClient.get(`/words/teacher/student-progress/${studentId}`);
    },

    async updateProfile(data: { firstName?: string; lastName?: string; bio?: string }): Promise<User> {
        const updatedUser = await apiClient.put<User>('/auth/profile', data);

        const token = this.getToken();
        const fullUser = { ...updatedUser, access_token: token };
        localStorage.setItem('mewo_user', JSON.stringify(fullUser));
        return fullUser;
    },

    async uploadAvatar(file: File): Promise<User> {
        const formData = new FormData();
        formData.append('file', file);

        const updatedUser = await apiClient.post<User>('/auth/avatar', formData);

        const token = this.getToken();
        const fullUser = { ...updatedUser, access_token: token };
        localStorage.setItem('mewo_user', JSON.stringify(fullUser));
        return fullUser;
    },

    async changePassword(data: { otp?: string; newPassword?: string }): Promise<any> {
        return apiClient.post('/auth/change-password', data);
    },

    async sendOtp(): Promise<any> {
        return apiClient.post('/auth/send-otp');
    },

    /* Helper to get token for non-apiClient needs (if any) */
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
