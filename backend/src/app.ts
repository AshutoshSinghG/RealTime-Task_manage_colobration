import express, { Application } from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import notificationRoutes from './routes/notification.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { initializeSocket } from './socket/socket';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

// CORS configuration - Allow only frontend URL
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const startServer = async (): Promise<void> => {
    await connectDatabase();

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();

export default app;
