import { apiClient } from '../utils/api';
import {
    Task,
    CreateTaskData,
    UpdateTaskData,
    TasksResponse,
    TaskFilters
} from '../types/task.types';

export const taskApi = {
    getTasks: async (filters: TaskFilters = {}, page = 1, limit = 20): Promise<TasksResponse> => {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.assignedToId) params.append('assignedToId', filters.assignedToId);
        if (filters.creatorId) params.append('creatorId', filters.creatorId);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const { data } = await apiClient.get<TasksResponse>(`/tasks?${params.toString()}`);
        return data;
    },

    createTask: async (taskData: CreateTaskData): Promise<{ task: Task }> => {
        const { data } = await apiClient.post<{ task: Task }>('/tasks', taskData);
        return data;
    },

    updateTask: async (taskId: string, updateData: UpdateTaskData): Promise<{ task: Task }> => {
        const { data } = await apiClient.put<{ task: Task }>(`/tasks/${taskId}`, updateData);
        return data;
    },

    deleteTask: async (taskId: string): Promise<void> => {
        await apiClient.delete(`/tasks/${taskId}`);
    },

    assignTask: async (taskId: string, assignedToId: string): Promise<{ task: Task }> => {
        const { data } = await apiClient.post<{ task: Task }>(`/tasks/${taskId}/assign`, {
            assignedToId
        });
        return data;
    }
};
