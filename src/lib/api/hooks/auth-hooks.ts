'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { AuthResponseDto, LoginDto, RegisterDto, RefreshTokenDto } from '../types';
import { useApiMutation } from './base-hooks';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

// Hook for user login
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const response = await apiClient.post<AuthResponseDto>('/auth/login', credentials);
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response;
    },
    onSuccess: (data) => {
      // Update user data in the cache
      queryClient.setQueryData(['user', 'profile'], data.user);
      
      // Show success toast
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.firstName}!`,
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
}

// Hook for user registration
export function useRegister() {
  const router = useRouter();
  
  return useApiMutation<AuthResponseDto, RegisterDto>('/auth/register', 'POST', {
    onSuccess: (data) => {
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Show success toast
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully.',
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Could not create your account',
        variant: 'destructive',
      });
    },
  });
}

// Hook for token refresh
export function useRefreshToken() {
  return useApiMutation<AuthResponseDto, RefreshTokenDto>('/auth/refresh', 'POST', {
    onSuccess: (data) => {
      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    },
  });
}

// Hook for user logout
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async () => {
      // If we have a server-side logout endpoint
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await apiClient.post('/auth/logout', { refreshToken });
        }
      } catch (error) {
        // Continue with client-side logout even if server logout fails
        console.error('Server logout failed', error);
      }
      
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      
      return true;
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      
      // Show success toast
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      
      // Redirect to home page
      router.push('/');
    },
  });
}