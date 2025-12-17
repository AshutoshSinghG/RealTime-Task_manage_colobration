import { apiClient } from '../utils/api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/user.types';

export const authApi = {
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
        return data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        const { data } = await apiClient.get<{ user: User }>('/auth/me');
        return data;
    }
};
