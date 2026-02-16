
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({
                user,
                isAuthenticated: !!user
            }),
            updateUser: (data) => set((state) => ({
                user: state.user ? { ...state.user, ...data } : null
            })),
            logout: () => {
                set({ user: null, isAuthenticated: false });
                localStorage.removeItem('mewo_last_tab');
                // We handle redirection in the component or a dedicated hook
            },
        }),
        {
            name: 'mewo-auth-storage',
            // Manual mapping to match existing mewo_user key if we want to be backward compatible
            // or just use this new store as the source of truth.
        }
    )
);
