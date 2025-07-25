'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';

// Hook for handling authentication redirects
export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Get return URL from search params
  const returnUrl = searchParams?.get('returnUrl');
  const reason = searchParams?.get('reason');

  // Redirect after successful authentication
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRedirected) {
      const targetUrl = returnUrl && returnUrl !== '/auth/login' ? returnUrl : '/dashboard';
      setHasRedirected(true);
      router.push(targetUrl);
    }
  }, [isAuthenticated, isLoading, returnUrl, router, hasRedirected]);

  // Function to redirect to login with current path as return URL
  const redirectToLogin = (customReturnUrl?: string) => {
    const currentPath = window.location.pathname + window.location.search;
    const targetReturnUrl = customReturnUrl || currentPath;
    const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(targetReturnUrl)}`;
    router.push(loginUrl);
  };

  // Function to redirect to register with current path as return URL
  const redirectToRegister = (customReturnUrl?: string) => {
    const currentPath = window.location.pathname + window.location.search;
    const targetReturnUrl = customReturnUrl || currentPath;
    const registerUrl = `/auth/register?returnUrl=${encodeURIComponent(targetReturnUrl)}`;
    router.push(registerUrl);
  };

  // Function to redirect after logout
  const redirectAfterLogout = () => {
    router.push('/auth/login?reason=logout');
  };

  return {
    returnUrl,
    reason,
    redirectToLogin,
    redirectToRegister,
    redirectAfterLogout,
    hasRedirected,
  };
}

// Hook for handling session expiration
export function useSessionExpiration() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Handle session expiration
  const handleSessionExpiration = () => {
    if (isAuthenticated && !sessionExpired) {
      setSessionExpired(true);
      logout();
      router.push('/auth/login?reason=session-expired');
    }
  };

  // Reset session expiration flag
  const resetSessionExpiration = () => {
    setSessionExpired(false);
  };

  return {
    sessionExpired,
    handleSessionExpiration,
    resetSessionExpiration,
  };
}

// Hook for handling authentication state changes
export function useAuthStateChange() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (previousAuthState !== null && previousAuthState !== isAuthenticated) {
        // Authentication state changed
        if (isAuthenticated) {
          // User just logged in
          console.log('User logged in:', user);
        } else {
          // User just logged out
          console.log('User logged out');
        }
      }
      setPreviousAuthState(isAuthenticated);
    }
  }, [isAuthenticated, isLoading, user, previousAuthState]);

  return {
    isAuthenticated,
    user,
    isLoading,
    authStateChanged: previousAuthState !== null && previousAuthState !== isAuthenticated,
  };
}

// Hook for handling authentication errors
export function useAuthError() {
  const { error, clearError } = useAuth();
  const [displayError, setDisplayError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setDisplayError(error);
    }
  }, [error]);

  const dismissError = () => {
    setDisplayError(null);
    clearError();
  };

  const getErrorMessage = (error: string): string => {
    // Map common error messages to user-friendly messages
    const errorMessages: Record<string, string> = {
      'Invalid credentials': 'The email or password you entered is incorrect.',
      'User not found': 'No account found with this email address.',
      'Email already exists': 'An account with this email already exists.',
      'Session expired': 'Your session has expired. Please log in again.',
      'Network Error': 'Unable to connect to the server. Please check your internet connection.',
      'Unauthorized': 'You are not authorized to perform this action.',
    };

    return errorMessages[error] || error;
  };

  return {
    error: displayError,
    dismissError,
    getErrorMessage,
    hasError: !!displayError,
  };
}