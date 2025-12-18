import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../sockets/socket';

export const useSocket = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleTaskCreated = (data: any) => {
            console.log('✅ Socket event received: task:created', data);
            // Invalidate all task queries to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskUpdated = (data: any) => {
            console.log('✅ Socket event received: task:updated', data);
            // Invalidate all task queries to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskDeleted = (data: any) => {
            console.log('✅ Socket event received: task:deleted', data);
            // Invalidate all task queries to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskAssigned = (data: any) => {
            console.log('✅ Socket event received: task:assigned', data);
            // Invalidate all task queries to refresh the dashboard
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleNotificationNew = (data: any) => {
            console.log('✅ Socket event received: notification:new', data);
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
