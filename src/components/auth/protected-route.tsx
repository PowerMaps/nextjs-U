'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';

// Loading component for authentication check
function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
}

// Props for ProtectedRoute component
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

// Protected route component
export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/auth/login',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store the attempted URL for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, requireAuth, router, redirectTo, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <AuthLoadingSpinner />;
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  // If authentication is not required or user is authenticated, render children
  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    fallback?: ReactNode;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute 
        redirectTo={options.redirectTo}
        fallback={options.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Component for routes that should only be accessible to guests (non-authenticated users)
interface GuestOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestOnlyRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: GuestOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // If user is authenticated, don't render children (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  // If user is not authenticated, render children
  return <>{children}</>;
}

// Higher-order component for guest-only pages
export function withGuestOnly<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <GuestOnlyRoute redirectTo={options.redirectTo}>
        <Component {...props} />
      </GuestOnlyRoute>
    );
  };

  WrappedComponent.displayName = `withGuestOnly(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for conditional rendering based on authentication
export function useAuthGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const renderIfAuthenticated = (component: ReactNode, fallback?: ReactNode) => {
    if (isLoading) return fallback || null;
    return isAuthenticated ? component : fallback || null;
  };

  const renderIfGuest = (component: ReactNode, fallback?: ReactNode) => {
    if (isLoading) return fallback || null;
    return !isAuthenticated ? component : fallback || null;
  };

  const renderByRole = (roleComponents: Record<string, ReactNode>, fallback?: ReactNode) => {
    if (isLoading || !isAuthenticated || !user) return fallback || null;
    return roleComponents[user.role] || fallback || null;
  };

  return {
    renderIfAuthenticated,
    renderIfGuest,
    renderByRole,
    isAuthenticated,
    isLoading,
    user,
  };
}