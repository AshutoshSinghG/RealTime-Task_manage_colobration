import { Task, ITask, TaskStatus, TaskPriority } from '../models/Task.model';
import { Types } from 'mongoose';

export interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    creatorId?: string;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export class TaskRepository {
    async create(taskData: Partial<ITask>): Promise<ITask> {
        const task = new Task(taskData);
        const savedTask = await task.save();
        return savedTask.populate([{ path: 'creatorId', select: 'name email' }, { path: 'assignedToId', select: 'name email' }]) as any;
    }

    async findById(id: string | Types.ObjectId): Promise<ITask | null> {
        return Task.findById(id).populate([{ path: 'creatorId', select: 'name email' }, { path: 'assignedToId', select: 'name email' }]) as any;
    }

    async findByUserId(
        userId: string | Types.ObjectId,
        filters: TaskFilters = {},
        pagination: PaginationOptions = { page: 1, limit: 20 }
    ): Promise<{ tasks: ITask[]; total: number }> {
        const query: any = {
            $or: [
                { creatorId: userId },
                { assignedToId: userId }
            ]
        };

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.priority) {
            query.priority = filters.priority;
        }

        if (filters.assignedToId) {
            query.assignedToId = filters.assignedToId;
        }

        if (filters.creatorId) {
            query.creatorId = filters.creatorId;
        }

        const skip = (pagination.page - 1) * pagination.limit;

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .populate([{ path: 'creatorId', select: 'name email' }, { path: 'assignedToId', select: 'name email' }])
                .sort({ dueDate: 1, createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit),
            Task.countDocuments(query)
        ]);

        return { tasks, total };
    }

    async updateById(id: string | Types.ObjectId, updateData: Partial<ITask>): Promise<ITask | null> {
        return Task.findByIdAndUpdate(id, updateData, { new: true }).populate([{ path: 'creatorId', select: 'name email' }, { path: 'assignedToId', select: 'name email' }]) as any;
    }

    async deleteById(id: string | Types.ObjectId): Promise<ITask | null> {
        return Task.findByIdAndDelete(id);
    }

    async findAll(
        filters: TaskFilters = {},
        pagination: PaginationOptions = { page: 1, limit: 20 }
    ): Promise<{ tasks: ITask[]; total: number }> {
        const query: any = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.priority) {
            query.priority = filters.priority;
        }

        if (filters.assignedToId) {
            query.assignedToId = filters.assignedToId;
        }

        if (filters.creatorId) {
            query.creatorId = filters.creatorId;
        }

        const skip = (pagination.page - 1) * pagination.limit;

        const [tasks, total] = await Promise.all([
            Task.find(query)
                .populate([{ path: 'creatorId', select: 'name email' }, { path: 'assignedToId', select: 'name email' }])
                .sort({ dueDate: 1, createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit),
            Task.countDocuments(query)
        ]);

        return { tasks, total };
    }
}

export default new TaskRepository();
