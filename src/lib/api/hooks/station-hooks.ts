'use client';

import { useApiQuery, useApiMutation, usePaginatedApiQuery } from './base-hooks';
import { ChargingStationResponseDto, PaginationQueryDto, ReviewResponseDto } from '../types';
import { toast } from '@/components/ui/use-toast';
import { offlineStorage } from './base-hooks';
import { apiClient } from '../client';
import { useQueryClient } from '@tanstack/react-query';

// Key for storing stations in local storage for offline access
const OFFLINE_STATIONS_KEY = 'offline_stations';

// Hook to get all charging stations with pagination and filters
export function useChargingStations(params: PaginationQueryDto & {
  city?: string;
  status?: string;
  connectorType?: string;
  lat?: number;
  lng?: number;
  radius?: number;
} = {}) {
  const queryClient = useQueryClient();
  const queryParams = { ...params };
  
  // Convert number parameters to strings for the API
  if (params.lat !== undefined) queryParams.lat = params.lat.toString() as any;
  if (params.lng !== undefined) queryParams.lng = params.lng.toString() as any;
  if (params.radius !== undefined) queryParams.radius = params.radius.toString() as any;
  
  const query = usePaginatedApiQuery<ChargingStationResponseDto>(
    ['stations', JSON.stringify(params)],
    '/stations',
    queryParams,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes - station data changes frequently
    }
  );

  // Handle success case
  if (query.data && !query.error) {
    const offlineStations = offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {};
    query.data.items?.forEach((station: ChargingStationResponseDto) => {
      offlineStations[station.id] = station;
    });
    offlineStorage.setItem(OFFLINE_STATIONS_KEY, offlineStations);
  }

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const offlineStations = offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {};
    const stations = Object.values(offlineStations);
    
    if (stations.length > 0 && !query.data) {
      // Create a mock paginated response with cached data
      const mockResponse = {
        items: stations,
        meta: {
          totalItems: stations.length,
          itemCount: stations.length,
          itemsPerPage: stations.length,
          totalPages: 1,
          currentPage: 1,
        },
      };
      
      queryClient.setQueryData(['stations', JSON.stringify(params)], mockResponse);
    }
  }

  return query;
}

// Hook to get nearby charging stations
export function useNearbyStations(lat: number, lng: number, radius: number = 10) {
  const queryClient = useQueryClient();
  
  const query = useApiQuery<ChargingStationResponseDto[]>(
    ['stations', 'nearby', lat.toString(), lng.toString(), radius.toString()],
    `/stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    {
      enabled: !!(lat && lng),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Handle success case
  if (query.data && !query.error) {
    const offlineStations = offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {};
    query.data.forEach(station => {
      offlineStations[station.id] = station;
    });
    offlineStorage.setItem(OFFLINE_STATIONS_KEY, offlineStations);
  }

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const offlineStations = offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {};
    const stations = Object.values(offlineStations);
    
    if (stations.length > 0 && !query.data) {
      const nearbyStations = stations.filter((station: any) => {
        const stationLat = station.location?.coordinates?.[1];
        const stationLng = station.location?.coordinates?.[0];
        if (!stationLat || !stationLng) return false;
        
        // Simple distance calculation (not accurate but works for caching)
        const latDiff = Math.abs(stationLat - lat);
        const lngDiff = Math.abs(stationLng - lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 <= radius;
      });
      
      queryClient.setQueryData(
        ['stations', 'nearby', lat.toString(), lng.toString(), radius.toString()], 
        nearbyStations
      );
    }
  }

  return query;
}

// Hook to get a single charging station by ID
export function useChargingStation(stationId: string) {
  const queryClient = useQueryClient();
  
  const query = useApiQuery<ChargingStationResponseDto>(
    ['station', stationId],
    `/stations/${stationId}`,
    {
      enabled: !!stationId,
      staleTime: 60 * 1000, // 1 minute
    }
  );

  // Handle success case
  if (query.data && !query.error) {
    const offlineStations = offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {};
    offlineStations[query.data.id] = query.data;
    offlineStorage.setItem(OFFLINE_STATIONS_KEY, offlineStations);
  }

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const offlineStations = offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {};
    const station = offlineStations[stationId];
    
    if (station && !query.data) {
      queryClient.setQueryData(['station', stationId], station);
    }
  }

  return query;
}

// Hook to get station reviews
export function useStationReviews(stationId: string, params: PaginationQueryDto = {}) {
  return usePaginatedApiQuery<ReviewResponseDto>(
    ['station', stationId, 'reviews', JSON.stringify(params)],
    `/stations/${stationId}/reviews`,
    params,
    {
      enabled: !!stationId,
    }
  );
}

// Hook to add a review for a station
export function useAddStationReview(stationId: string) {
  const queryClient = useQueryClient();
  
  return useApiMutation<ReviewResponseDto, { rating: number; comment?: string }>(
    `/stations/${stationId}/reviews`,
    'POST',
    {
      onSuccess: (data) => {
        // Invalidate reviews cache
        queryClient.invalidateQueries({ queryKey: ['station', stationId, 'reviews'] });
        
        toast({
          title: 'Review added',
          description: 'Your review has been added successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to add review',
          description: error.message || 'An error occurred while adding your review.',
          variant: 'destructive',
        });
      },
    }
  );
}

// Hook to get station availability (real-time connector status)
export function useStationAvailability(stationId: string) {
  return useApiQuery<{
    stationId: string;
    totalConnectors: number;
    availableConnectors: number;
    connectors: Array<{
      id: string;
      type: string;
      power: number;
      status: 'AVAILABLE' | 'IN_USE' | 'OFFLINE' | 'RESERVED';
    }>;
  }>(
    ['station', stationId, 'availability'],
    `/stations/${stationId}/availability`,
    {
      enabled: !!stationId,
      staleTime: 30 * 1000, // 30 seconds - real-time data
      refetchInterval: 60 * 1000, // Refetch every minute
    }
  );
}

// Hook to search stations by text
export function useSearchStations(query: string) {
  return useApiQuery<ChargingStationResponseDto[]>(
    ['stations', 'search', query],
    `/stations/search?q=${encodeURIComponent(query)}`,
    {
      enabled: !!query && query.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Hook to get favorite stations
export function useFavoriteStations() {
  return useApiQuery<ChargingStationResponseDto[]>(
    ['stations', 'favorites'],
    '/stations/favorites',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Hook to add/remove station from favorites
export function useToggleFavoriteStation() {
  const queryClient = useQueryClient();
  
  return useApiMutation<{ isFavorite: boolean }, { stationId: string }>(
    '', // URL will be set in mutationFn
    'POST',
    {
      mutationFn: async ({ stationId }) => {
        return await apiClient.post(`/stations/${stationId}/toggle-favorite`);
      },
      onSuccess: (data, variables) => {
        // Invalidate favorites cache
        queryClient.invalidateQueries({ queryKey: ['stations', 'favorites'] });
        
        toast({
          title: data.isFavorite ? 'Added to favorites' : 'Removed from favorites',
          description: data.isFavorite 
            ? 'Station has been added to your favorites.' 
            : 'Station has been removed from your favorites.',
        });
      },
    }
  );
}

// Hook to get offline stations
export function useOfflineStations() {
  const offlineStations = typeof window !== 'undefined' 
    ? offlineStorage.getItem(OFFLINE_STATIONS_KEY) || {}
    : {};
    
  return {
    stations: Object.values(offlineStations) as ChargingStationResponseDto[],
    getStationById: (stationId: string) => offlineStations[stationId] as ChargingStationResponseDto | undefined,
    clearOfflineStations: () => {
      offlineStorage.removeItem(OFFLINE_STATIONS_KEY);
    },
  };
}