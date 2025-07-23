'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery } from './base-hooks';
import { NotificationResponseDto, PaginationQueryDto, UpdateNotificationDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Hook to get user notifications
export function useNotifications(params: PaginationQueryDto = {}) {
  return usePaginatedApiQuery<NotificationResponseDto>(
    ['notifications'],
    '/notifications',
    params,
    {
      // Shorter stale time for notifications
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

// Hook to get unread notification count
export function useUnreadNotificationCount() {
  return useApiQuery<{ count: number }>(
    ['notifications', 'unread', 'count'],
    '/notifications/unread/count',
    {
      // Shorter stale time for notification count
      staleTime: 30 * 1000, // 30 seconds
      // Keep previous data while refetching
      placeholderData: (previousData) => previousData,
    }
  );
}

// Hook to mark notification as read
export function useUpdateNotification() {
  const queryClient = useQueryClient();
  
  return useApiMutation<NotificationResponseDto, { id: string; data: UpdateNotificationDto }>(
    '', // URL will be set in mutationFn
    'PATCH',
    {
      mutationFn: async ({ id, data }) => {
        const { apiClient } = await import('../client');
        return await apiClient.patch(`/notifications/${id}`, data);
      },
      onSuccess: () => {
        // Invalidate notification queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', 'count'] });
      },
    }
  );
}

// Hook to mark all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useApiMutation<void, void>(
    '/notifications/mark-all-read',
    'POST',
    {
      onSuccess: () => {
        // Invalidate notification queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', 'count'] });
        
        toast({
          title: 'Notifications marked as read',
          description: 'All notifications have been marked as read.',
        });
      },
    }
  );
}

// Hook to update notification preferences
export function useUpdateNotificationPreferences() {
  return useApiMutation<void, { preferences: Record<string, boolean> }>(
    '/notifications/preferences',
    'PATCH',
    {
      onSuccess: () => {
        toast({
          title: 'Preferences updated',
          description: 'Your notification preferences have been updated.',
        });
      },
    }
  );
}

// Hook to register for push notifications
export function useRegisterPushNotifications() {
  return useApiMutation<{ success: boolean }, { token: string }>(
    '/notifications/register-device',
    'POST',
    {
      onSuccess: () => {
        toast({
          title: 'Push notifications enabled',
          description: 'You will now receive push notifications.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Push notification setup failed',
          description: error.message || 'Could not enable push notifications.',
          variant: 'destructive',
        });
      },
    }
  );
}