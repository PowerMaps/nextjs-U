// hooks/useGeolocation.ts
import { useState, useCallback } from 'react';
import { Coordinates } from '@/lib/api/types';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  location: { lat: number; lng: number } | null;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentLocation: () => Promise<{ lat: number; lng: number } | null>;
  clearError: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    location: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser';
        setState(prev => ({ ...prev, error, loading: false }));
        resolve(null);
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({
            loading: false,
            error: null,
            location,
          });
          resolve(location);
        },
        (error) => {
          let errorMessage: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error occurred';
              break;
          }
          setState({
            loading: false,
            error: errorMessage,
            location: null,
          });
          resolve(null);
        },
        options
      );
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearError,
  };
};