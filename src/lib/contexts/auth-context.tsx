'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  UserResponseDto
} from '@/lib/api/types';
import { useAuthStore } from '@/lib/store/auth-store';

// Authentication state interface
interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, refreshToken, setTokens, clearTokens , resetPreferences } = useAuthStore();

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, [accessToken, refreshToken]);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      if (!accessToken || !refreshToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Try to get current user with existing token
      await refreshUser();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid tokens
      clearTokens();
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Session expired. Please log in again.'
      }));
    }
  };

  // Login function
  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      delete credentials.rememberMe; // Ensure no confirmPassword field is sent
      const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
      
      const { accessToken, refreshToken, user } = response;

      // Store tokens
      setTokens({ accessToken, refreshToken });

      // Update state
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed. Please try again.',
      }));
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterDto): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await apiClient.post<AuthResponseDto>('/auth/register', userData);
      
      const { accessToken, refreshToken, user } = response;

      // Store tokens
      setTokens({ accessToken, refreshToken });

      // Update state
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed. Please try again.',
      }));
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    try {
      // Clear all auth-related state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Clear tokens from auth store
      clearTokens();

      // Reset preferences to default
      resetPreferences();

      // Clear React Query cache - THIS IS CRITICAL to prevent data persistence
      queryClient.clear();

      // Clear all localStorage items
      if (typeof window !== 'undefined') {
        // Clear auth-related items
        localStorage.removeItem('auth-store');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Clear cached query data
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('queryData:')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear location history
        localStorage.removeItem('recentLocations');
        localStorage.removeItem('savedLocations');

        // Clear saved routes
        localStorage.removeItem('savedRoutes');

        // Clear offline queue
        localStorage.removeItem('offlineQueue');
      }

      // Call logout endpoint to invalidate tokens on server (optional)
      // apiClient.post('/auth/logout').catch(console.error);

      // Redirect to login page
      setTimeout(() => {
        router.push('/auth/login');
      }, 100);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      const user = await apiClient.get<UserResponseDto>('/auth/me');
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      // If getting user fails, tokens might be invalid
      clearTokens();
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Failed to refresh user data',
      }));
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export context for advanced usage
export { AuthContext };