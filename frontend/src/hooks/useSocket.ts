import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../sockets/socket';

export const useSocket = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleTaskCreated = () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskUpdated = () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskDeleted = () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleTaskAssigned = () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        };

        const handleNotificationNew = () => {
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
