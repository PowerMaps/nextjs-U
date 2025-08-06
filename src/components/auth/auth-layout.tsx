'use client';

import React, { ReactNode } from 'react';
import { useAuthError, useAuthRedirect } from '@/lib/auth';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackToHome?: boolean;
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showBackToHome = true 
}: AuthLayoutProps) {
  const { error, dismissError, getErrorMessage, hasError } = useAuthError();
  const { reason } = useAuthRedirect();

  // Get reason-specific messages
  const getReasonMessage = (reason: string | null | undefined) => {
    switch (reason) {
      case 'session-expired':
        return {
          type: 'warning' as const,
          message: 'Your session has expired. Please log in again.',
        };
      case 'logout':
        return {
          type: 'info' as const,
          message: 'You have been logged out successfully.',
        };
      case 'unauthorized':
        return {
          type: 'error' as const,
          message: 'You need to log in to access this page.',
        };
      default:
        return null;
    }
  };

  const reasonMessage = getReasonMessage(reason);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo or Brand */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">CT</span>
          </div>
        </div>
        
        {/* Title */}
        {title && (
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
        )}
        
        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
        
        {/* Back to home link */}
        {showBackToHome && (
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to home
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Reason message */}
          {reasonMessage && (
            <div className={`mb-4 p-3 rounded-md ${
              reasonMessage.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : reasonMessage.type === 'warning'
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <p className="text-sm">{reasonMessage.message}</p>
            </div>
          )}
          
          {/* Error message */}
          {hasError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <div className="flex justify-between items-start">
                <p className="text-sm text-red-700">
                  {getErrorMessage(error!)}
                </p>
                <button
                  onClick={dismissError}
                  className="text-red-400 hover:text-red-600 ml-2"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Main content */}
          {children}
        </div>
      </div>
    </div>
  );
}