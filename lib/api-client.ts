export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private getToken(): string {
        if (typeof window === 'undefined') return '';
        const userStr = localStorage.getItem('mewo_user');
        if (!userStr || userStr === 'undefined' || userStr === 'null') return '';

        try {
            const user = JSON.parse(userStr);
            return user.access_token || user.token || '';
        } catch (e) {
            console.error('[ApiClient] Error parsing user token:', e);
            return '';
        }
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();

        // Start with default headers and merge with options.headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        // Only add token if Authorization header is not already provided
        if (token && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Handles FormData (remove Content-Type to let browser set boundary)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 401) {
            console.warn('Unauthorized access - token expired or invalid');
            if (typeof window !== 'undefined') {
                // Clear all auth data
                localStorage.removeItem('mewo_user');
                // Optional: Clear other app state if needed
                // Dispatch a custom event if we want other components to react without reload
                window.dispatchEvent(new Event('auth:logout'));

                // Force reload to reset app state to login screen
                // We use reload instead of router.push to ensure clean state
                window.location.href = '/';

                // Return a promise that never resolves to halt execution while reloading
                return new Promise(() => { });
            }
        }

        if (!response.ok) {
            let errorMessage = `API Error: ${response.statusText} (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // response was not JSON
            }
            throw new Error(errorMessage);
        }

        // Some endpoints might return empty body (204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {} as T;
    }

    get<T>(endpoint: string, options?: RequestInit) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body?: any, options?: RequestInit) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    put<T>(endpoint: string, body?: any, options?: RequestInit) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    delete<T>(endpoint: string, options?: RequestInit) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
