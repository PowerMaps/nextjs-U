'use client';

import { useApiQuery, useApiMutation } from './base-hooks';
import { BookingRequestDto, BookingResponseDto, PaginationQueryDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Hook to get user's bookings
export function useUserBookings(params: PaginationQueryDto & {
  status?: string;
} = {}) {
  return useApiQuery<{
    items: BookingResponseDto[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>(
    ['bookings', 'user', JSON.stringify(params)],
    `/bookings/user?${new URLSearchParams(params as any).toString()}`,
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

// Hook to get a specific booking
export function useBooking(bookingId: string) {
  return useApiQuery<BookingResponseDto>(
    ['booking', bookingId],
    `/bookings/${bookingId}`,
    {
      enabled: !!bookingId,
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

// Hook to create a new booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useApiMutation<BookingResponseDto, BookingRequestDto>(
    '/reservations',
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate reservations cache
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        
        // Invalidate station availability cache
        queryClient.invalidateQueries({ 
          queryKey: ['station', data.connector.station.id, 'availability'] 
        });
        
        toast({
          title: 'Booking created',
          description: `Your booking for ${data.connector.station.name} has been created successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Booking failed',
          description: error.message || 'Failed to create booking. Please try again.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to cancel a booking
export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useApiMutation<BookingResponseDto, { bookingId: string }>(
    '', // URL will be set in mutationFn
    'PATCH',
    {
      mutationFn: async ({ bookingId }) => {
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to cancel booking');
        }
        
        return response.json();
      },
      onSuccess: (data) => {
        // Invalidate bookings cache
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        
        // Invalidate station availability cache
        queryClient.invalidateQueries({ 
          queryKey: ['station', data.connector.station.id, 'availability'] 
        });
        
        toast({
          title: 'Booking cancelled',
          description: 'Your booking has been cancelled successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Cancellation failed',
          description: error.message || 'Failed to cancel booking. Please try again.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to check connector availability for a specific time slot
export function useCheckConnectorAvailability(connectorId: string, startTime: string, endTime: string) {
  return useApiQuery<{
    available: boolean;
    conflictingBookings: BookingResponseDto[];
    suggestedTimes?: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>(
    ['connector', connectorId, 'availability', startTime, endTime],
    `/connectors/${connectorId}/availability?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
    {
      enabled: !!(connectorId && startTime && endTime),
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

// Hook to get connector pricing
export function useConnectorPricing(connectorId: string) {
  return useApiQuery<{
    connectorId: string;
    pricePerKwh: number;
    currency: string;
    timeBasedPricing?: Array<{
      startTime: string;
      endTime: string;
      pricePerKwh: number;
    }>;
  }>(
    ['connector', connectorId, 'pricing'],
    `/connectors/${connectorId}/pricing`,
    {
      enabled: !!connectorId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}