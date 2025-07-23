'use client';

import { useApiQuery } from './base-hooks';
import { WeatherInfo } from '../types';
import { offlineStorage } from './base-hooks';
import { apiClient } from '../client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Key for storing weather data in local storage for offline access
const OFFLINE_WEATHER_KEY = 'offline_weather';

// Hook to get current weather for a location
export function useWeather(lat: number, lng: number) {
  const queryClient = useQueryClient();
  
  const query = useApiQuery<WeatherInfo>(
    ['weather', lat.toString(), lng.toString()],
    `/weather/current?lat=${lat}&lng=${lng}`,
    {
      enabled: !!(lat && lng),
      staleTime: 10 * 60 * 1000, // 10 minutes - weather data doesn't change too frequently
    }
  );

  // Handle success case
  if (query.data && !query.error) {
    const offlineWeather = offlineStorage.getItem(OFFLINE_WEATHER_KEY) || {};
    const locationKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    offlineWeather[locationKey] = {
      ...query.data,
      timestamp: new Date().toISOString(),
    };
    offlineStorage.setItem(OFFLINE_WEATHER_KEY, offlineWeather);
  }

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const offlineWeather = offlineStorage.getItem(OFFLINE_WEATHER_KEY) || {};
    const locationKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cachedData = offlineWeather[locationKey];
    
    if (cachedData) {
      queryClient.setQueryData(['weather', lat.toString(), lng.toString()], cachedData);
    }
  }

  return query;
}

// Hook to get weather forecast for a location
export function useWeatherForecast(lat: number, lng: number, days: number = 5) {
  const queryClient = useQueryClient();
  
  const query = useApiQuery<WeatherInfo[]>(
    ['weather', 'forecast', lat.toString(), lng.toString(), days.toString()],
    `/weather/forecast?lat=${lat}&lng=${lng}&days=${days}`,
    {
      enabled: !!(lat && lng),
      staleTime: 30 * 60 * 1000, // 30 minutes - forecast data is less volatile
    }
  );

  // Handle success case
  if (query.data && !query.error) {
    const offlineForecasts = offlineStorage.getItem('offline_weather_forecasts') || {};
    const locationKey = `${lat.toFixed(2)},${lng.toFixed(2)}_${days}`;
    offlineForecasts[locationKey] = {
      data: query.data,
      timestamp: new Date().toISOString(),
    };
    offlineStorage.setItem('offline_weather_forecasts', offlineForecasts);
  }

  // Handle error case - try to use cached data if offline
  if (query.error && (query.error.message === 'Network Error' || query.error.message.includes('Failed to fetch'))) {
    const offlineForecasts = offlineStorage.getItem('offline_weather_forecasts') || {};
    const locationKey = `${lat.toFixed(2)},${lng.toFixed(2)}_${days}`;
    const cachedData = offlineForecasts[locationKey]?.data;
    
    if (cachedData && !query.data) {
      queryClient.setQueryData(
        ['weather', 'forecast', lat.toString(), lng.toString(), days.toString()], 
        cachedData
      );
    }
  }

  return query;
}

// Hook to get weather along a route
export function useRouteWeather(routeCoordinates: Array<{ lat: number; lng: number }>) {
  const coordinatesString = routeCoordinates
    .map(coord => `${coord.lat},${coord.lng}`)
    .join('|');
  
  return useQuery<WeatherInfo[]>({
    queryKey: ['weather', 'route', coordinatesString],
    queryFn: async () => {
      const response = await apiClient.post<WeatherInfo[]>('/weather/route', {
        coordinates: routeCoordinates,
      });
      return response;
    },
    enabled: routeCoordinates.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook to get offline weather data
export function useOfflineWeather() {
  const offlineWeather = typeof window !== 'undefined' 
    ? offlineStorage.getItem(OFFLINE_WEATHER_KEY) || {}
    : {};
    
  return {
    weatherData: offlineWeather,
    getWeatherByLocation: (lat: number, lng: number) => {
      const locationKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
      return offlineWeather[locationKey];
    },
    clearOfflineWeather: () => {
      offlineStorage.removeItem(OFFLINE_WEATHER_KEY);
    },
  };
}