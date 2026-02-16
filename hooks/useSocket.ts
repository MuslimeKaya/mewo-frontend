
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { socketService } from '../services/socketService';

export const useSocket = () => {
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user?.access_token) {
            socketService.connect(user.access_token);
        } else {
            socketService.disconnect();
        }

        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, user?.access_token]);
};
