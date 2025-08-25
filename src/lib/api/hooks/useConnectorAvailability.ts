
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from '../client';
import { BookingResponseDto, ChargingStationResponseDto } from '../types';

// Types for availability checking
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  estimatedCost?: number;
}

export interface ConflictingBooking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface NearbyAlternative {
  stationId: string;
  stationName: string;
  distance: number;
  availableSlots: TimeSlot[];
}

export interface AvailabilityResult {
  available: boolean;
  conflictingBookings: ConflictingBooking[];
  suggestedTimes: TimeSlot[];
  nearbyAlternatives?: NearbyAlternative[];
  reason?: string;
  checkedAt: string;
}

export interface AvailabilityCheckParams {
  connectorId: string;
  startTime: string;
  endTime: string;
  includeAlternatives?: boolean;
  maxAlternatives?: number;
}

// Cache configuration
const AVAILABILITY_CACHE_TIME = 30 * 1000; // 30 seconds
const AVAILABILITY_STALE_TIME = 15 * 1000; // 15 seconds
const DEBOUNCE_DELAY = 500; // 500ms

// Utility function to create cache key
const createAvailabilityCacheKey = (params: AvailabilityCheckParams): string[] => {
  return [
    'connector-availability',
    params.connectorId,
    params.startTime,
    params.endTime,
    params.includeAlternatives ? 'with-alternatives' : 'no-alternatives'
  ];
};

// API function to fetch availability
const fetchConnectorAvailability = async (
  params: AvailabilityCheckParams
): Promise<AvailabilityResult> => {
  const queryParams = new URLSearchParams({
    startTime: params.startTime,
    endTime: params.endTime,
    includeAlternatives: params.includeAlternatives ? 'true' : 'false',
    maxAlternatives: (params.maxAlternatives || 3).toString()
  });

  const response = await apiClient.get<AvailabilityResult>(
    `/connectors/${params.connectorId}/availability?${queryParams}`
  );

  return {
    ...response,
    checkedAt: new Date().toISOString()
  };
};

// Mock implementation for development/testing
const createMockAvailabilityResult = (params: AvailabilityCheckParams): AvailabilityResult => {
  const isAvailable = Math.random() > 0.3; // 70% chance of availability
  const start = new Date(params.startTime);
  const end = new Date(params.endTime);
  const duration = end.getTime() - start.getTime();

  let conflictingBookings: ConflictingBooking[] = [];
  let suggestedTimes: TimeSlot[] = [];

  if (!isAvailable) {
    // Create mock conflicting booking
    conflictingBookings = [{
      id: 'mock-booking-1',
      startTime: new Date(start.getTime() - 30 * 60 * 1000).toISOString(),
      endTime: new Date(start.getTime() + 30 * 60 * 1000).toISOString(),
      status: 'CONFIRMED'
    }];

    // Generate alternative time slots
    for (let i = 1; i <= 3; i++) {
      const altStart = new Date(start.getTime() + i * 60 * 60 * 1000);
      const altEnd = new Date(altStart.getTime() + duration);
      
      suggestedTimes.push({
        startTime: altStart.toISOString(),
        endTime: altEnd.toISOString(),
        available: true,
        estimatedCost: Math.round((duration / (1000 * 60 * 60)) * 0.25 * 100) / 100 // Mock cost calculation
      });
    }
  }

  return {
    available: isAvailable,
    conflictingBookings,
    suggestedTimes,
    reason: isAvailable ? undefined : 'Time slot conflicts with existing booking',
    checkedAt: new Date().toISOString()
  };
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Main availability checking hook
export function useConnectorAvailability(
  connectorId: string,
  startTime: string,
  endTime: string,
  options: {
    enabled?: boolean;
    includeAlternatives?: boolean;
    maxAlternatives?: number;
    realTimeUpdates?: boolean;
    debounceMs?: number;
  } = {}
) {
  const {
    enabled = true,
    includeAlternatives = true,
    maxAlternatives = 3,
    realTimeUpdates = true,
    debounceMs = DEBOUNCE_DELAY
  } = options;

  // Debounce the time parameters to prevent excessive API calls
  const debouncedStartTime = useDebounce(startTime, debounceMs);
  const debouncedEndTime = useDebounce(endTime, debounceMs);

  // Create query parameters
  const queryParams = useMemo((): AvailabilityCheckParams => ({
    connectorId,
    startTime: debouncedStartTime,
    endTime: debouncedEndTime,
    includeAlternatives,
    maxAlternatives
  }), [connectorId, debouncedStartTime, debouncedEndTime, includeAlternatives, maxAlternatives]);

  // Create cache key
  const queryKey = useMemo(() => createAvailabilityCacheKey(queryParams), [queryParams]);

  // Validate time parameters
  const isValidTimeRange = useMemo(() => {
    if (!debouncedStartTime || !debouncedEndTime) return false;
    const start = new Date(debouncedStartTime);
    const end = new Date(debouncedEndTime);
    // For testing, allow past dates
    const now = process.env.NODE_ENV === 'test' ? new Date('2023-01-01') : new Date();
    return start < end && start > now;
  }, [debouncedStartTime, debouncedEndTime]);

  // Main query
  const query = useQuery({
    queryKey,
    queryFn: () => fetchConnectorAvailability(queryParams),
    enabled: enabled && !!connectorId && isValidTimeRange,
    staleTime: AVAILABILITY_STALE_TIME,
    gcTime: AVAILABILITY_CACHE_TIME,
    refetchOnWindowFocus: realTimeUpdates,
    refetchInterval: realTimeUpdates ? 30000 : false, // Refetch every 30 seconds if real-time is enabled
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for validation errors
      if (failureCount >= 2) return false;
      const apiError = error as any;
      return apiError?.status !== 400 && apiError?.status !== 422;
    }
  });

  return {
    ...query,
    // Additional computed properties
    isChecking: query.isFetching,
    hasConflicts: query.data?.conflictingBookings?.length > 0,
    hasSuggestions: query.data?.suggestedTimes?.length > 0,
    hasAlternatives: query.data?.nearbyAlternatives?.length > 0,
    isValidTimeRange,
    // Helper methods
    refetchAvailability: query.refetch
  };
}

// Hook for checking multiple time slots at once
export function useMultipleAvailabilityCheck(
  connectorId: string,
  timeSlots: Array<{ startTime: string; endTime: string }>,
  options: {
    enabled?: boolean;
    includeAlternatives?: boolean;
  } = {}
) {
  const { enabled = true, includeAlternatives = false } = options;
  const queryClient = useQueryClient();

  // Create queries for each time slot
  const queries = timeSlots.map(slot => {
    const queryParams: AvailabilityCheckParams = {
      connectorId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      includeAlternatives
    };
    
    return {
      queryKey: createAvailabilityCacheKey(queryParams),
      queryFn: () => fetchConnectorAvailability(queryParams),
      enabled: enabled && !!connectorId,
      staleTime: AVAILABILITY_STALE_TIME,
      gcTime: AVAILABILITY_CACHE_TIME
    };
  });

  // Use useQueries for parallel execution
  const results = useQuery({
    queryKey: ['multiple-availability', connectorId, JSON.stringify(timeSlots)],
    queryFn: async () => {
      const promises = timeSlots.map(slot => {
        const queryParams: AvailabilityCheckParams = {
          connectorId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          includeAlternatives
        };
        return fetchConnectorAvailability(queryParams);
      });
      
      return Promise.all(promises);
    },
    enabled: enabled && !!connectorId && timeSlots.length > 0,
    staleTime: AVAILABILITY_STALE_TIME,
    gcTime: AVAILABILITY_CACHE_TIME
  });

  return {
    ...results,
    availabilityResults: results.data || [],
    availableSlots: results.data?.filter(result => result.available) || [],
    unavailableSlots: results.data?.filter(result => !result.available) || []
  };
}

// Hook for real-time availability updates with WebSocket-like behavior
export function useRealTimeAvailability(
  connectorId: string,
  startTime: string,
  endTime: string,
  options: {
    enabled?: boolean;
    updateInterval?: number;
  } = {}
) {
  const { enabled = true, updateInterval = 15000 } = options; // 15 seconds default
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();

  const baseQuery = useConnectorAvailability(connectorId, startTime, endTime, {
    enabled,
    realTimeUpdates: true
  });

  // Set up real-time polling
  useEffect(() => {
    if (!enabled || !connectorId || !startTime || !endTime) {
      return;
    }

    const pollAvailability = () => {
      const queryParams: AvailabilityCheckParams = {
        connectorId,
        startTime,
        endTime,
        includeAlternatives: true
      };
      
      const queryKey = createAvailabilityCacheKey(queryParams);
      queryClient.invalidateQueries({ queryKey });
    };

    intervalRef.current = setInterval(pollAvailability, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [connectorId, startTime, endTime, enabled, updateInterval, queryClient]);

  return baseQuery;
}

// Hook for caching and prefetching availability data
export function useAvailabilityCache() {
  const queryClient = useQueryClient();

  const prefetchAvailability = useCallback(async (
    connectorId: string,
    startTime: string,
    endTime: string,
    includeAlternatives = true
  ) => {
    const queryParams: AvailabilityCheckParams = {
      connectorId,
      startTime,
      endTime,
      includeAlternatives
    };
    
    const queryKey = createAvailabilityCacheKey(queryParams);
    
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => fetchConnectorAvailability(queryParams),
      staleTime: AVAILABILITY_STALE_TIME
    });
  }, [queryClient]);

  const invalidateAvailability = useCallback((connectorId?: string) => {
    if (connectorId) {
      queryClient.invalidateQueries({
        queryKey: ['connector-availability', connectorId]
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ['connector-availability']
      });
    }
  }, [queryClient]);

  const getCachedAvailability = useCallback((
    connectorId: string,
    startTime: string,
    endTime: string,
    includeAlternatives = true
  ): AvailabilityResult | undefined => {
    const queryParams: AvailabilityCheckParams = {
      connectorId,
      startTime,
      endTime,
      includeAlternatives
    };
    
    const queryKey = createAvailabilityCacheKey(queryParams);
    return queryClient.getQueryData<AvailabilityResult>(queryKey);
  }, [queryClient]);

  return {
    prefetchAvailability,
    invalidateAvailability,
    getCachedAvailability
  };
}
