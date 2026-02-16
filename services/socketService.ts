
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io(API_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected to server');
        });

        this.socket.on('notification', (data: { title: string; message: string; type: string }) => {
            console.log('[Socket] Notification received:', data);

            // Professional Notification using Sonner
            toast(data.title, {
                description: data.message,
                action: data.type === 'assignment' ? {
                    label: 'Görüntüle',
                    onClick: () => {
                        // This will depend on our routing, but for now just a toast
                        console.log('Navigate to assignment');
                    }
                } : undefined,
            });
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected from server');
        });

        this.socket.on('error', (err) => {
            console.error('[Socket] Connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
