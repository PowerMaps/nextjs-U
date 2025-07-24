'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { LoginDto, RegisterDto } from '@/lib/api/types';
import { useState, useEffect } from 'react';

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

// Hook for session timeout management
export function useSessionTimeout() {
  const { user, isAuthenticated } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Session timeout settings (in milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout
  
  // Update last activity on user interactions
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated]);
  
  const updateLastActivity = () => {
    setLastActivity(Date.now());
  };
  
  const getTimeUntilExpiration = () => {
    if (!isAuthenticated) return null;
    const timeElapsed = Date.now() - lastActivity;
    const timeRemaining = SESSION_TIMEOUT - timeElapsed;
    return timeRemaining > 0 ? timeRemaining : 0;
  };
  
  const shouldShowWarning = () => {
    if (!isAuthenticated) return false;
    const timeRemaining = getTimeUntilExpiration();
    return timeRemaining !== null && timeRemaining <= WARNING_TIME && timeRemaining > 0;
  };
  
  const isSessionExpired = () => {
    if (!isAuthenticated) return false;
    const timeRemaining = getTimeUntilExpiration();
    return timeRemaining === 0;
  };
  
  return {
    updateLastActivity,
    getTimeUntilExpiration,
    shouldShowWarning,
    isSessionExpired,
    lastActivity,
  };
}