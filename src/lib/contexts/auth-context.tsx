'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  const { accessToken, refreshToken, setTokens, clearTokens, preferences } = useAuthStore();

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
      // Call logout endpoint to invalidate tokens on server
      apiClient.post('/auth/logout').catch(console.error);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state and tokens regardless of API call result
      clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      // Redirect to login page
      router.push('/auth/login');
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