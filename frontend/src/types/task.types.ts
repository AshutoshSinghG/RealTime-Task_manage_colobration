import { User } from './user.types';

export enum TaskStatus {
    TODO = 'To Do',
    IN_PROGRESS = 'In Progress',
    REVIEW = 'Review',
    COMPLETED = 'Completed'
}

export enum TaskPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent'
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    creatorId: User | string;
    assignedToId?: User | string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId?: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedToId?: string | null;
}

export interface TaskFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    creatorId?: string;
}

export interface TasksResponse {
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
}
