export interface Notification {
    _id: string;
    userId: string;
    message: string;
    taskId?: {
        _id: string;
        title: string;
    };
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
}
