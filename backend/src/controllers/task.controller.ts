import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import taskService from '../services/task.service';
import taskRepository from '../repositories/task.repository';
import notificationService from '../services/notification.service';
import userRepository from '../repositories/user.repository';

export class TaskController {
    async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const filters = {
                status: req.query.status as any,
                priority: req.query.priority as any,
                assignedToId: req.query.assignedToId as string,
                creatorId: req.query.creatorId as string
            };

            const pagination = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 20
            };

            const result = await taskService.getTasks(req.user.userId, filters, pagination);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const task = await taskService.createTask(req.body, req.user.userId);

            if (req.body.assignedToId && req.body.assignedToId !== req.user.userId) {
                await notificationService.createNotification(
                    req.body.assignedToId,
                    `You have been assigned a new task: "${task.title}"`,
                    task._id.toString()
                );
            }

            res.status(201).json({ task });
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const { id } = req.params;
            const task = await taskService.updateTask(id, req.body, req.user.userId);

            // Extract user IDs properly - handle both ObjectId and populated objects
            const assignedToId = task.assignedToId
                ? (typeof task.assignedToId === 'object' && '_id' in task.assignedToId
                    ? (task.assignedToId as any)._id.toString()
                    : (task.assignedToId as any).toString())
                : null;

            const creatorId = task.creatorId
                ? (typeof task.creatorId === 'object' && '_id' in task.creatorId
                    ? (task.creatorId as any)._id.toString()
                    : (task.creatorId as any).toString())
                : null;

            const notifyUserId = assignedToId !== req.user.userId
                ? assignedToId
                : creatorId;

            if (notifyUserId && notifyUserId !== req.user.userId) {
                const user = await userRepository.findById(req.user.userId);
                await notificationService.createNotification(
                    notifyUserId,
                    `Task "${task.title}" was updated by ${user?.name}`,
                    task._id.toString()
                );
            }

            res.json({ task });
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const { id } = req.params;

            // Get task to check creator
            const task = await taskRepository.findById(id);
            if (!task) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            // Verify user is the task creator
            const creatorId = typeof task.creatorId === 'object' && '_id' in task.creatorId
                ? (task.creatorId as any)._id.toString()
                : (task.creatorId as any).toString();

            if (creatorId !== req.user.userId) {
                res.status(403).json({
                    error: 'Only the task creator can delete this task'
                });
                return;
            }

            await taskService.deleteTask(id, req.user.userId);

            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async assignTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const { id } = req.params;
            const { assignedToId } = req.body;

            const task = await taskService.assignTask(id, assignedToId, req.user.userId);

            const assigner = await userRepository.findById(req.user.userId);
            await notificationService.createNotification(
                assignedToId,
                `${assigner?.name} assigned you to task: "${task.title}"`,
                task._id.toString()
            );

            res.json({ task });
        } catch (error) {
            next(error);
        }
    }
}

export default new TaskController();
