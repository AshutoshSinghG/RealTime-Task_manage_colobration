import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';

describe('Socket.io Events', () => {
    let io: SocketIOServer;
    let clientSocket: ClientSocket;
    let httpServer: any;

    beforeAll((done) => {
        httpServer = createServer();

        // Create simple socket server without authentication for testing
        io = new SocketIOServer(httpServer, {
            cors: {
                origin: '*',
                credentials: true
            }
        });

        httpServer.listen(() => {
            const port = (httpServer.address() as any).port;

            // Connect client
            clientSocket = ioClient(`http://localhost:${port}`, {
                transports: ['websocket']
            });

            clientSocket.on('connect', () => {
                done();
            });

            clientSocket.on('connect_error', (err: Error) => {
                console.error('Connection error:', err.message);
                done();
            });
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.disconnect();
        httpServer.close();
    });

    test('should emit and receive task:created event', (done) => {
        const mockTask = {
            _id: '507f1f77bcf86cd799439012',
            title: 'New Task',
            status: 'To Do',
            priority: 'High'
        };

        clientSocket.on('task:created', (data: any) => {
            expect(data).toEqual(mockTask);
            done();
        });

        // Emit from server to all clients
        io.emit('task:created', mockTask);
    });

    test('should emit and receive task:updated event', (done) => {
        const mockTask = {
            _id: '507f1f77bcf86cd799439012',
            title: 'Updated Task',
            status: 'In Progress'
        };

        clientSocket.on('task:updated', (data: any) => {
            expect(data.title).toBe('Updated Task');
            expect(data.status).toBe('In Progress');
            done();
        });

        io.emit('task:updated', mockTask);
    });

    test('should emit and receive notification:new event', (done) => {
        const mockNotification = {
            _id: '507f1f77bcf86cd799439013',
            message: 'You have been assigned a task',
            isRead: false
        };

        clientSocket.on('notification:new', (data: any) => {
            expect(data.message).toBe('You have been assigned a task');
            expect(data.isRead).toBe(false);
            done();
        });

        io.emit('notification:new', mockNotification);
    });
});
