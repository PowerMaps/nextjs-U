"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader, Libraries } from '@googlemaps/js-api-loader';

interface UseGoogleMapsOptions {
  apiKey?: string;
  libraries?: Libraries;
  version?: string;
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const loaderRef = useRef<Loader | null>(null);

  const {
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries = ['places', 'geometry'],
    version = 'weekly'
  } = options;

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is required'));
      return;
    }

    if (loaderRef.current) {
      return; // Already loading or loaded
    }

    loaderRef.current = new Loader({
      apiKey,
      version,
      libraries
    });

    loaderRef.current
      .load()
      .then(() => {
        setIsLoaded(true);
        setLoadError(null);
      })
      .catch((error) => {
        setLoadError(error);
        setIsLoaded(false);
      });

    return () => {
      loaderRef.current = null;
    };
  }, [apiKey, version, libraries.join(',')]);

  return {
    isLoaded,
    loadError,
    google: typeof window !== 'undefined' && isLoaded ? window.google : null
  };
}