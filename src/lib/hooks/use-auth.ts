'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { LoginDto, RegisterDto } from '@/lib/api/types';
import { useState } from 'react';

// Hook for login functionality
export function useLogin() {
  const { login, isLoading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: LoginDto) => {
    try {
      setIsSubmitting(true);
      clearError();
      await login(credentials);
    } catch (error) {
      // Error is already handled in the context
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    login: handleLogin,
    isLoading: isLoading || isSubmitting,
    error,
    clearError,
  };
}

// Hook for registration functionality
export function useRegister() {
  const { register, isLoading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (userData: RegisterDto) => {
    try {
      setIsSubmitting(true);
      clearError();
      await register(userData);
    } catch (error) {
      // Error is already handled in the context
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register: handleRegister,
    isLoading: isLoading || isSubmitting,
    error,
    clearError,
  };
}

// Hook for logout functionality
export function useLogout() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout: handleLogout,
    isLoggingOut,
  };
}

// Hook for checking authentication status
export function useAuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    isGuest: !isAuthenticated && !isLoading,
  };
}

// Hook for user profile data
export function useCurrentUser() {
  const { user, refreshUser, isLoading } = useAuth();

  return {
    user,
    refreshUser,
    isLoading,
  };
}

// Hook for protected operations
export function useProtectedAction() {
  const { isAuthenticated, isLoading } = useAuth();

  const executeIfAuthenticated = <T extends any[], R>(
    action: (...args: T) => R,
    fallback?: () => void
  ) => {
    return (...args: T): R | void => {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated) {
        if (fallback) {
          fallback();
        } else {
          console.warn('Action requires authentication');
        }
        return;
      }

      return action(...args);
    };
  };

  return {
    executeIfAuthenticated,
    isAuthenticated,
    isLoading,
  };
}