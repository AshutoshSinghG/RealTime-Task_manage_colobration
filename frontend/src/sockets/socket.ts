import { io, Socket } from 'socket.io-client';

// Get the API URL and remove /api suffix for socket connection
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
    return socket;
};

export const initializeSocket = (): Socket => {
    if (socket?.connected) {
        return socket;
    }

    console.log('🔌 Connecting to socket:', SOCKET_URL);

    socket = io(SOCKET_URL, {
        withCredentials: true,  // Important: sends cookies with socket connection
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'] // Try WebSocket first, fallback to polling
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    // Log all received events for debugging
    socket.onAny((eventName, ...args) => {
        console.log(`📩 Socket event received: ${eventName}`, args);
    });

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
