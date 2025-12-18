import taskRepository, { TaskFilters, PaginationOptions } from '../repositories/task.repository';
import { ITask } from '../models/Task.model';
import { AuditLog } from '../models/AuditLog.model';
import { Types } from 'mongoose';
import { Server } from 'socket.io';

export class TaskService {
    private io: Server | null = null;

    setSocketIO(io: Server) {
        this.io = io;
    }

    async createTask(
        taskData: Partial<ITask>,
        creatorId: string
    ): Promise<ITask> {
        const task = await taskRepository.create({
            ...taskData,
            creatorId: new Types.ObjectId(creatorId)
        });

        await this.logAudit({
            taskId: task._id,
            userId: new Types.ObjectId(creatorId),
            action: 'created',
            newValue: `Task "${task.title}" created`
        });

        // Emit to both creator and assignee for real-time creation
        const taskCreatorId = typeof task.creatorId === 'object' && '_id' in task.creatorId
            ? (task.creatorId as any)._id.toString()
            : (task.creatorId as any).toString();

        const taskAssigneeId = task.assignedToId
            ? (typeof task.assignedToId === 'object' && '_id' in task.assignedToId
                ? (task.assignedToId as any)._id.toString()
                : (task.assignedToId as any).toString())
            : null;

        this.io?.to(taskCreatorId).emit('task:created', task);
        if (taskAssigneeId && taskAssigneeId !== taskCreatorId) {
            this.io?.to(taskAssigneeId).emit('task:created', task);
        }

        return task;
    }

    async updateTask(
        taskId: string,
        updateData: Partial<ITask>,
        userId: string
    ): Promise<ITask> {
        const existingTask = await taskRepository.findById(taskId);
        if (!existingTask) {
            throw new Error('Task not found');
        }

        const updatedTask = await taskRepository.updateById(taskId, updateData);
        if (!updatedTask) {
            throw new Error('Failed to update task');
        }

        const changes = this.detectChanges(existingTask, updateData);
        if (changes.length > 0) {
            for (const change of changes) {
                await this.logAudit({
                    taskId: new Types.ObjectId(taskId),
                    userId: new Types.ObjectId(userId),
                    action: change.action,
                    previousValue: change.previousValue,
                    newValue: change.newValue
                });
            }
        }

        // Emit to both creator and assignee for real-time updates
        const creatorId = typeof updatedTask.creatorId === 'object' && '_id' in updatedTask.creatorId
            ? (updatedTask.creatorId as any)._id.toString()
            : (updatedTask.creatorId as any).toString();

        const assigneeId = updatedTask.assignedToId
            ? (typeof updatedTask.assignedToId === 'object' && '_id' in updatedTask.assignedToId
                ? (updatedTask.assignedToId as any)._id.toString()
                : (updatedTask.assignedToId as any).toString())
            : null;

        this.io?.to(creatorId).emit('task:updated', updatedTask);
        if (assigneeId && assigneeId !== creatorId) {
            this.io?.to(assigneeId).emit('task:updated', updatedTask);
        }

        return updatedTask;
    }

    async deleteTask(taskId: string, userId: string): Promise<void> {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        // Get creator and assignee IDs before deletion
        const creatorId = typeof task.creatorId === 'object' && '_id' in task.creatorId
            ? (task.creatorId as any)._id.toString()
            : (task.creatorId as any).toString();

        const assigneeId = task.assignedToId
            ? (typeof task.assignedToId === 'object' && '_id' in task.assignedToId
                ? (task.assignedToId as any)._id.toString()
                : (task.assignedToId as any).toString())
            : null;

        await taskRepository.deleteById(taskId);

        await this.logAudit({
            taskId: new Types.ObjectId(taskId),
            userId: new Types.ObjectId(userId),
            action: 'deleted',
            previousValue: `Task "${task.title}"`
        });

        // Emit to both creator and assignee for real-time deletion
        this.io?.to(creatorId).emit('task:deleted', { taskId });
        if (assigneeId && assigneeId !== creatorId) {
            this.io?.to(assigneeId).emit('task:deleted', { taskId });
        }
    }

    async getTasks(
        userId: string,
        filters: TaskFilters = {},
        pagination: PaginationOptions = { page: 1, limit: 20 }
    ): Promise<{ tasks: ITask[]; total: number; page: number; limit: number }> {
        const result = await taskRepository.findByUserId(userId, filters, pagination);
        return {
            ...result,
            page: pagination.page,
            limit: pagination.limit
        };
    }

    async assignTask(
        taskId: string,
        assigneeId: string,
        assignedBy: string
    ): Promise<ITask> {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        const updatedTask = await taskRepository.updateById(taskId, {
            assignedToId: new Types.ObjectId(assigneeId)
        });

        if (!updatedTask) {
            throw new Error('Failed to assign task');
        }

        await this.logAudit({
            taskId: new Types.ObjectId(taskId),
            userId: new Types.ObjectId(assignedBy),
            action: 'assigned',
            previousValue: task.assignedToId?.toString(),
            newValue: assigneeId
        });

        this.io?.emit('task:assigned', {
            task: updatedTask,
            assigneeId
        });

        return updatedTask;
    }

    async logAudit(auditData: {
        taskId: Types.ObjectId;
        userId: Types.ObjectId;
        action: string;
        previousValue?: string;
        newValue?: string;
    }): Promise<void> {
        await AuditLog.create(auditData);
    }

    private detectChanges(
        existingTask: ITask,
        updateData: Partial<ITask>
    ): Array<{ action: string; previousValue?: string; newValue?: string }> {
        const changes: Array<{ action: string; previousValue?: string; newValue?: string }> = [];

        if (updateData.status && updateData.status !== existingTask.status) {
            changes.push({
                action: 'status_changed',
                previousValue: existingTask.status,
                newValue: updateData.status
            });
        }

        if (updateData.priority && updateData.priority !== existingTask.priority) {
            changes.push({
                action: 'priority_changed',
                previousValue: existingTask.priority,
                newValue: updateData.priority
            });
        }

        if (updateData.title && updateData.title !== existingTask.title) {
            changes.push({
                action: 'title_changed',
                previousValue: existingTask.title,
                newValue: updateData.title
            });
        }

        return changes;
    }
}

export default new TaskService();
