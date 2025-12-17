import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/notification.api';

export const useNotifications = () => {
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 30000
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        notifications: notificationsQuery.data?.notifications || [],
        unreadCount: notificationsQuery.data?.unreadCount || 0,
        isLoading: notificationsQuery.isLoading,
        markAsRead: (notificationId: string) => markAsReadMutation.mutateAsync(notificationId),
        markAllAsRead: () => markAllAsReadMutation.mutateAsync()
    };
};
