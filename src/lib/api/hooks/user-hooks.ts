'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery, useOptimisticUpdateConfig } from './base-hooks';
import { CreateUserDto, PaginationQueryDto, UpdateUserDto, UserResponseDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from './base-hooks';

// Key for storing user profile in local storage for offline access
const USER_PROFILE_KEY = 'user_profile';

// Hook to get current user profile
export function useUserProfile() {
  const queryClient = useQueryClient();
  
  return useApiQuery<UserResponseDto>(
    ['user', 'profile'],
    '/users/profile',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Store user profile for offline access when successful
      meta: {
        onSuccess: (data: UserResponseDto) => {
          offlineStorage.setItem(USER_PROFILE_KEY, data);
        },
      },
    }
  );
}

// Hook to get user by ID (admin only)
export function useUserById(userId: string) {
  return useApiQuery<UserResponseDto>(
    ['user', userId],
    `/users/${userId}`,
    {
      enabled: !!userId,
    }
  );
}

// Hook to get all users with pagination (admin only)
export function useUsers(params: PaginationQueryDto = {}) {
  return usePaginatedApiQuery<UserResponseDto>(
    ['users', JSON.stringify(params)],
    '/users',
    params
  );
}

// Hook to update user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const queryKey = ['user', 'profile'];
  
  return useApiMutation<UserResponseDto, UpdateUserDto>(
    '/users/profile',
    'PATCH',
    {
      ...useOptimisticUpdateConfig<UserResponseDto, UpdateUserDto>(
        queryKey,
        (oldData, variables) => ({
          ...oldData,
          ...variables,
          preferences: {
            ...oldData.preferences,
            ...(variables.preferences || {}),
          },
        })
      ),
      onSuccess: (data) => {
        // Update offline storage
        offlineStorage.setItem(USER_PROFILE_KEY, data);
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      },
    }
  );
}

// Hook to update user by ID (admin only)
export function useUpdateUser(userId: string) {
  const queryKey = ['user', userId];
  
  return useApiMutation<UserResponseDto, UpdateUserDto>(
    `/users/${userId}`,
    'PATCH',
    {
      ...useOptimisticUpdateConfig<UserResponseDto, UpdateUserDto>(
        queryKey,
        (oldData, variables) => ({
          ...oldData,
          ...variables,
          preferences: {
            ...oldData.preferences,
            ...(variables.preferences || {}),
          },
        })
      ),
      onSuccess: (data) => {
        toast({
          title: 'User updated',
          description: `User ${data.firstName} ${data.lastName} has been updated.`,
        });
      },
    }
  );
}

// Hook to create a new user (admin only)
export function useCreateUser() {
  return useApiMutation<UserResponseDto, CreateUserDto>(
    '/users',
    'POST',
    {
      onSuccess: (data) => {
        toast({
          title: 'User created',
          description: `User ${data.firstName} ${data.lastName} has been created.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to create user',
          description: error.message || 'An error occurred while creating the user.',
          variant: 'destructive',
        });
      },
    }
  );
}