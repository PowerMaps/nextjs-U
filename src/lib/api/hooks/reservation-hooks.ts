'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery, useOptimisticUpdateConfig } from './base-hooks';
import { PaginationQueryDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from './base-hooks';

// Types for reservations
interface ReservationResponseDto {
  id: string;
  stationId: string;
  connectorId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface CreateReservationDto {
  stationId: string;
  connectorId: string;
  startTime: string;
  endTime: string;
}

interface UpdateReservationDto {
  startTime?: string;
  endTime?: string;
  status?: 'CANCELLED';
}

// Key for storing reservations in local storage for offline access
const OFFLINE_RESERVATIONS_KEY = 'offline_reservations';

// Hook to get user's reservations
export function useReservations(params: PaginationQueryDto = {}) {
  const queryClient = useQueryClient();
  
  const query = usePaginatedApiQuery<ReservationResponseDto>(
    ['reservations', JSON.stringify(params)],
    '/reservations',
    params
  );

  // Handle success case
  if (query.data && !query.error) {
    offlineStorage.setItem(OFFLINE_RESERVATIONS_KEY, query.data.items);
  }

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const cachedReservations = offlineStorage.getItem(OFFLINE_RESERVATIONS_KEY);
    if (cachedReservations && !query.data) {
      const mockResponse = {
        items: cachedReservations,
        meta: {
          totalItems: cachedReservations.length,
          itemCount: cachedReservations.length,
          itemsPerPage: cachedReservations.length,
          totalPages: 1,
          currentPage: 1,
        },
      };
      queryClient.setQueryData(['reservations', JSON.stringify(params)], mockResponse);
    }
  }

  return query;
}

// Hook to get a single reservation by ID
export function useReservation(reservationId: string) {
  const queryClient = useQueryClient();
  
  const query = useApiQuery<ReservationResponseDto>(
    ['reservation', reservationId],
    `/reservations/${reservationId}`,
    {
      enabled: !!reservationId,
    }
  );

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const cachedReservations = offlineStorage.getItem(OFFLINE_RESERVATIONS_KEY) || [];
    const reservation = cachedReservations.find((r: any) => r.id === reservationId);
    
    if (reservation && !query.data) {
      queryClient.setQueryData(['reservation', reservationId], reservation);
    }
  }

  return query;
}

// Hook to create a new reservation
export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useApiMutation<ReservationResponseDto, CreateReservationDto>(
    '/reservations',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate reservations list
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        
        // Update station availability cache
        queryClient.invalidateQueries({ 
          queryKey: ['station', data.stationId, 'availability'] 
        });
        
        toast({
          title: 'Reservation created',
          description: 'Your charging station reservation has been created successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to create reservation',
          description: error.message || 'An error occurred while creating your reservation.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to update a reservation
export function useUpdateReservation(reservationId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['reservation', reservationId];
  
  return useApiMutation<ReservationResponseDto, UpdateReservationDto>(
    `/reservations/${reservationId}`,
    'PATCH',
    {
      ...useOptimisticUpdateConfig<ReservationResponseDto, UpdateReservationDto>(
        queryKey,
        (oldData, variables) => ({
          ...oldData,
          ...variables,
          updatedAt: new Date().toISOString(),
        })
      ),
      onSuccess: (data) => {
        // Invalidate reservations list
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        
        // Update station availability cache
        queryClient.invalidateQueries({ 
          queryKey: ['station', data.stationId, 'availability'] 
        });
        
        toast({
          title: 'Reservation updated',
          description: 'Your reservation has been updated successfully.',
        });
      },
    }
  );
}

// Hook to cancel a reservation
export function useCancelReservation() {
  const queryClient = useQueryClient();
  
  return useApiMutation<ReservationResponseDto, string>(
    '', // URL will be set in mutationFn
    'PATCH',
    {
      mutationFn: async (reservationId: string) => {
        return await apiClient.patch(`/reservations/${reservationId}/cancel`);
      },
      onSuccess: (data) => {
        // Invalidate reservations list
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        
        // Update station availability cache
        queryClient.invalidateQueries({ 
          queryKey: ['station', data.stationId, 'availability'] 
        });
        
        toast({
          title: 'Reservation cancelled',
          description: 'Your reservation has been cancelled successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to cancel reservation',
          description: error.message || 'An error occurred while cancelling your reservation.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to check connector availability for a time slot
export function useConnectorAvailability(
  stationId: string, 
  connectorId: string, 
  startTime: string, 
  endTime: string
) {
  return useApiQuery<{ available: boolean; conflictingReservations?: ReservationResponseDto[] }>(
    ['connector', connectorId, 'availability', startTime, endTime],
    `/stations/${stationId}/connectors/${connectorId}/availability?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
    {
      enabled: !!(stationId && connectorId && startTime && endTime),
      // Don't cache this for long as availability changes frequently
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

// Import missing apiClient
import { apiClient } from '../client';