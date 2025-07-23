'use client';

import { useApiQuery, useApiMutation } from './base-hooks';
import { RouteRequestDto, RouteResponseDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { offlineStorage } from './base-hooks';

// Key for storing routes in local storage for offline access
const OFFLINE_ROUTES_KEY = 'offline_routes';

// Hook to calculate a route
export function useCalculateRoute() {
  return useApiMutation<RouteResponseDto, RouteRequestDto>(
    '/routing/calculate',
    'POST',
    {
      onSuccess: (data, variables) => {
        // Store successful route in local storage for offline access
        const offlineRoutes = offlineStorage.getItem(OFFLINE_ROUTES_KEY) || {};
        const routeKey = `${variables.origin}-${variables.destination}-${variables.vehicleId}`;
        
        offlineRoutes[routeKey] = {
          route: data,
          timestamp: new Date().toISOString(),
          request: variables,
        };
        
        offlineStorage.setItem(OFFLINE_ROUTES_KEY, offlineRoutes);
      },
      onError: (error) => {
        toast({
          title: 'Route calculation failed',
          description: error.message || 'Could not calculate the route. Please try again.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to get a saved route by ID
export function useSavedRoute(routeId: string) {
  return useApiQuery<RouteResponseDto>(
    ['route', routeId],
    `/routing/saved-routes/${routeId}`,
    {
      enabled: !!routeId,
      // Use stale data if offline
      staleTime: Infinity,
    }
  );
}

// Hook to get all saved routes
export function useSavedRoutes() {
  return useApiQuery<RouteResponseDto[]>(
    ['routes', 'saved'],
    '/routing/saved-routes',
    {
      // Use stale data if offline
      staleTime: Infinity,
    }
  );
}

// Hook to save a route
export function useSaveRoute() {
  return useApiMutation<{ id: string }, { route: RouteResponseDto; name: string }>(
    '/routing/saved-routes',
    'POST',
    {
      onSuccess: (data) => {
        toast({
          title: 'Route saved',
          description: 'Your route has been saved successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to save route',
          description: error.message || 'Could not save your route. Please try again.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to delete a saved route
export function useDeleteSavedRoute() {
  return useApiMutation<void, string>(
    '', // URL will be set in mutationFn
    'DELETE',
    {
      mutationFn: async (routeId: string) => {
        const { apiClient } = await import('../client');
        return await apiClient.delete(`/routing/saved-routes/${routeId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Route deleted',
          description: 'Your saved route has been deleted.',
        });
      },
    }
  );
}

// Hook to get offline routes
export function useOfflineRoutes() {
  const offlineRoutes = typeof window !== 'undefined' 
    ? offlineStorage.getItem(OFFLINE_ROUTES_KEY) || {}
    : {};
    
  return {
    routes: Object.values(offlineRoutes),
    getRouteByKey: (origin: string, destination: string, vehicleId: string) => {
      const routeKey = `${origin}-${destination}-${vehicleId}`;
      return offlineRoutes[routeKey];
    },
    clearOfflineRoutes: () => {
      offlineStorage.removeItem(OFFLINE_ROUTES_KEY);
    },
  };
}