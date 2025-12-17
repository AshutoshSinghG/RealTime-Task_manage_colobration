import { apiClient } from '../utils/api';
import { Notification, NotificationsResponse } from '../types/notification.types';

export const notificationApi = {
    getNotifications: async (): Promise<NotificationsResponse> => {
        const { data } = await apiClient.get<NotificationsResponse>('/notifications');
        return data;
    },

    getUnreadNotifications: async (): Promise<{ notifications: Notification[] }> => {
        const { data } = await apiClient.get<{ notifications: Notification[] }>('/notifications/unread');
        return data;
    },

    markAsRead: async (notificationId: string): Promise<{ notification: Notification }> => {
        const { data } = await apiClient.put<{ notification: Notification }>(
            `/notifications/${notificationId}/read`
        );
        return data;
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.put('/notifications/read-all');
    }
};
