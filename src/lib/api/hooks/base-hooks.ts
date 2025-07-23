'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../client';
import { PaginatedResponseDto, PaginationQueryDto } from '../types';
import { toast } from '@/components/ui/use-toast';

// Type for API error
export type ApiError = Error & {
  status?: number;
  data?: any;
};

// Base hook for fetching data
export function useApiQuery<TData = unknown, TError = ApiError>(
  queryKey: string[],
  url: string,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        return await apiClient.get<TData>(url);
      } catch (error) {
        const apiError = error as ApiError;
        throw apiError;
      }
    },
    ...options,
  });
}

// Base hook for paginated queries
export function usePaginatedApiQuery<TData = unknown, TError = ApiError>(
  queryKey: string[],
  url: string,
  params: PaginationQueryDto = {},
  options?: Omit<UseQueryOptions<PaginatedResponseDto<TData>, TError, PaginatedResponseDto<TData>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponseDto<TData>, TError>({
    queryKey: [...queryKey, JSON.stringify(params)],
    queryFn: async () => {
      try {
        return await apiClient.get<PaginatedResponseDto<TData>>(url, {
          params,
        });
      } catch (error) {
        const apiError = error as ApiError;
        throw apiError;
      }
    },
    ...options,
  });
}

// Base hook for mutations (create, update, delete)
export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      try {
        switch (method) {
          case 'POST':
            return await apiClient.post<TData>(url, variables);
          case 'PUT':
            return await apiClient.put<TData>(url, variables);
          case 'PATCH':
            return await apiClient.patch<TData>(url, variables);
          case 'DELETE':
            return await apiClient.delete<TData>(url);
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      } catch (error) {
        const apiError = error as ApiError;
        throw apiError;
      }
    },
    ...options,
  });
}

// Hook to handle optimistic updates
export function useOptimisticUpdateConfig<TData, TVariables>(
  queryKey: string[],
  updateFn: (oldData: TData, variables: TVariables) => TData
) {
  const queryClient = useQueryClient();
  
  return {
    onMutate: async (variables: TVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<TData>(queryKey, (old) => 
          old ? updateFn(old, variables) : old
        );
      }
      
      return { previousData };
    },
    onError: (err: ApiError, variables: TVariables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      // Show error toast
      toast({
        title: 'Error',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync with server
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

// Helper for offline support
export const offlineStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting item from localStorage', error);
      return null;
    }
  },
  
  setItem: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting item in localStorage', error);
    }
  },
  
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage', error);
    }
  },
};