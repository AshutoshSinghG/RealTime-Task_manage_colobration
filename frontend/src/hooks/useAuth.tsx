import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/auth.api';
import { User, LoginCredentials, RegisterCredentials } from '../types/user.types';
import { handleApiError } from '../utils/api';
import { initializeSocket, disconnectSocket } from '../sockets/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: Infinity
  });

  const user = userData?.user || null;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      // Delay to ensure auth cookie is set before socket connection
      const timer = setTimeout(() => {
        console.log('🔌 Initializing socket after login...');
        initializeSocket();
      }, 1000); // Increased to 1 second
      return () => clearTimeout(timer);
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], { user: data.user });
      setError(null);
      navigate('/dashboard');
    },
    onError: (err) => {
      setError(handleApiError(err));
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], { user: data.user });
      setError(null);
      navigate('/dashboard');
    },
    onError: (err) => {
      setError(handleApiError(err));
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      disconnectSocket();
      navigate('/login');
    }
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
