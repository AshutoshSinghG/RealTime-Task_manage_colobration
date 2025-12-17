import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import authService from '../services/auth.service';
import taskService from '../services/task.service';
import notificationService from '../services/notification.service';

export const initializeSocket = (httpServer: HTTPServer): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true
        }
    });

    io.use(async (socket: Socket, next) => {
        try {
            // Try to get token from handshake auth first
            let token = socket.handshake.auth.token;

            // If no token in auth, try to get from cookies
            if (!token && socket.handshake.headers.cookie) {
                const cookies = cookie.parse(socket.handshake.headers.cookie);
                token = cookies.token;
            }

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const payload = authService.verifyJWT(token);
            socket.data.user = payload;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user.userId;
        console.log(`User ${userId} connected to socket`);

        socket.join(userId);

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from socket`);
            socket.leave(userId);
        });
    });

    taskService.setSocketIO(io);
    notificationService.setSocketIO(io);

    return io;
};
