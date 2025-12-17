import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../sockets/socket';
import { Task } from '../types/task.types';
import { Notification } from '../types/notification.types';

export const useSocket = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleTaskCreated = (_task: Task) => {
            console.log('✅ Socket event received: task:created', _task);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskUpdated = (_task: Task) => {
            console.log('✅ Socket event received: task:updated', _task);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskDeleted = (_data: { taskId: string }) => {
            console.log('✅ Socket event received: task:deleted', _data);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskAssigned = (_data: { task: Task; assigneeId: string }) => {
            console.log('✅ Socket event received: task:assigned', _data);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleNotificationNew = (_notification: Notification) => {
            console.log('✅ Socket event received: notification:new', _notification);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        socket.on('task:created', handleTaskCreated);
        socket.on('task:updated', handleTaskUpdated);
        socket.on('task:deleted', handleTaskDeleted);
        socket.on('task:assigned', handleTaskAssigned);
        socket.on('notification:new', handleNotificationNew);

        return () => {
            socket.off('task:created', handleTaskCreated);
            socket.off('task:updated', handleTaskUpdated);
            socket.off('task:deleted', handleTaskDeleted);
            socket.off('task:assigned', handleTaskAssigned);
            socket.off('notification:new', handleNotificationNew);
        };
    }, [queryClient]);
};
