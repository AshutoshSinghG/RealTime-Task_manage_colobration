import { apiClient } from '../utils/api';
import { User } from '../types/user.types';

export const userApi = {
    getAllUsers: async (): Promise<{ users: User[] }> => {
        const response = await apiClient.get('/users');
        return response.data;
    }
};
