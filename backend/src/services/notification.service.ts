import notificationRepository from '../repositories/notification.repository';
import { INotification } from '../models/Notification.model';
import { Types } from 'mongoose';
import { Server } from 'socket.io';

export class NotificationService {
    private io: Server | null = null;

    setSocketIO(io: Server) {
        this.io = io;
    }

    async createNotification(
        userId: string,
        message: string,
        taskId?: string
    ): Promise<INotification> {
        const notification = await notificationRepository.create({
            userId: new Types.ObjectId(userId),
            message,
            taskId: taskId ? new Types.ObjectId(taskId) : undefined
        });

        this.io?.to(userId).emit('notification:new', notification);

        return notification;
    }

    async getUserNotifications(userId: string, limit: number = 50): Promise<INotification[]> {
        return notificationRepository.findByUserId(userId, limit);
    }

    async getUnreadNotifications(userId: string): Promise<INotification[]> {
        return notificationRepository.findUnreadByUserId(userId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        return notificationRepository.getUnreadCount(userId);
    }

    async markNotificationAsRead(notificationId: string): Promise<INotification> {
        const notification = await notificationRepository.markAsRead(notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }
        return notification;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await notificationRepository.markAllAsReadForUser(userId);
    }
}

export default new NotificationService();
