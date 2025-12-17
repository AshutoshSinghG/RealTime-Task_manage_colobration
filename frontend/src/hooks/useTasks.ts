import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/task.api';
import { TaskFilters, CreateTaskData, UpdateTaskData } from '../types/task.types';

export const useTasks = (filters: TaskFilters = {}, page = 1, limit = 20) => {
    const queryClient = useQueryClient();

    const tasksQuery = useQuery({
        queryKey: ['tasks', filters, page, limit],
        queryFn: () => taskApi.getTasks(filters, page, limit),
        staleTime: 30000
    });

    const createTaskMutation = useMutation({
        mutationFn: taskApi.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskData }) =>
            taskApi.updateTask(taskId, data),
        onMutate: async ({ taskId, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            const previousTasks = queryClient.getQueryData(['tasks', filters, page, limit]);

            queryClient.setQueryData(['tasks', filters, page, limit], (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    tasks: old.tasks.map((task: any) =>
                        task._id === taskId ? { ...task, ...data } : task
                    )
                };
            });

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: taskApi.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const assignTaskMutation = useMutation({
        mutationFn: ({ taskId, assignedToId }: { taskId: string; assignedToId: string }) =>
            taskApi.assignTask(taskId, assignedToId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    return {
        tasks: tasksQuery.data?.tasks || [],
        total: tasksQuery.data?.total || 0,
        isLoading: tasksQuery.isLoading,
        isError: tasksQuery.isError,
        error: tasksQuery.error,
        createTask: (data: CreateTaskData) => createTaskMutation.mutateAsync(data),
        updateTask: (taskId: string, data: UpdateTaskData) =>
            updateTaskMutation.mutateAsync({ taskId, data }),
        deleteTask: (taskId: string) => deleteTaskMutation.mutateAsync(taskId),
        assignTask: (taskId: string, assignedToId: string) =>
            assignTaskMutation.mutateAsync({ taskId, assignedToId }),
        isCreating: createTaskMutation.isPending,
        isUpdating: updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending
    };
};
