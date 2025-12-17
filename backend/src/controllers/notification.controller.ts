import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import notificationService from '../services/notification.service';

export class NotificationController {
    async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const notifications = await notificationService.getUserNotifications(req.user.userId);
            const unreadCount = await notificationService.getUnreadCount(req.user.userId);

            res.json({ notifications, unreadCount });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const notifications = await notificationService.getUnreadNotifications(req.user.userId);

            res.json({ notifications });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const notification = await notificationService.markNotificationAsRead(id);

            res.json({ notification });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            await notificationService.markAllAsRead(req.user.userId);

            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
