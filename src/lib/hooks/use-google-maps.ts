"use client";

import { useEffect, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/maps/google-maps-loader';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(() => isGoogleMapsLoaded());
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (isLoaded) return;

    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMaps();
        setIsLoaded(true);
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Failed to load Google Maps'));
        setIsLoaded(false);
      }
    };

    initializeGoogleMaps();
  }, [isLoaded]);

  return {
    isLoaded,
    loadError,
    google: typeof window !== 'undefined' && isLoaded ? window.google : null
  };
}