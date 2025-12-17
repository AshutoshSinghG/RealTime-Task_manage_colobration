import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../models/Task.model';

export const createTaskSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    description: z.string().trim().optional().default(''),
    dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
    priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
    status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
    assignedToId: z.string().optional()
});

export const updateTaskSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(100, 'Title cannot exceed 100 characters')
        .trim()
        .optional(),
    description: z.string().trim().optional(),
    dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    assignedToId: z.string().nullable().optional()
});

export const assignTaskSchema = z.object({
    assignedToId: z.string().min(1, 'Assignee ID is required')
});

export const taskFilterSchema = z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignedToId: z.string().optional(),
    creatorId: z.string().optional(),
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20)
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type AssignTaskDTO = z.infer<typeof assignTaskSchema>;
export type TaskFilterDTO = z.infer<typeof taskFilterSchema>;
