import { Notification, INotification } from '../models/Notification.model';
import { Types } from 'mongoose';

export class NotificationRepository {
    async create(notificationData: Partial<INotification>): Promise<INotification> {
        const notification = new Notification(notificationData);
        return notification.save();
    }

    async findById(id: string | Types.ObjectId): Promise<INotification | null> {
        return Notification.findById(id);
    }

    async findByUserId(
        userId: string | Types.ObjectId,
        limit: number = 50
    ): Promise<INotification[]> {
        return Notification.find({ userId })
            .populate('taskId', 'title')
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    async findUnreadByUserId(userId: string | Types.ObjectId): Promise<INotification[]> {
        return Notification.find({ userId, isRead: false })
            .populate('taskId', 'title')
            .sort({ createdAt: -1 });
    }

    async markAsRead(id: string | Types.ObjectId): Promise<INotification | null> {
        return Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsReadForUser(userId: string | Types.ObjectId): Promise<void> {
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    async deleteById(id: string | Types.ObjectId): Promise<INotification | null> {
        return Notification.findByIdAndDelete(id);
    }

    async getUnreadCount(userId: string | Types.ObjectId): Promise<number> {
        return Notification.countDocuments({ userId, isRead: false });
    }
}

export default new NotificationRepository();
