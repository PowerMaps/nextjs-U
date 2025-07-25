import { Loader, Library } from '@googlemaps/js-api-loader';

// Extend the global Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

// Centralized Google Maps loader configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry'] as Library[],
};

let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

/**
 * Get a singleton instance of the Google Maps loader
 */
export function getGoogleMapsLoader(): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader(GOOGLE_MAPS_CONFIG);
  }
  return loaderInstance;
}

/**
 * Load Google Maps API (singleton pattern to prevent multiple loads)
 */
export async function loadGoogleMaps(): Promise<typeof google> {
  if (loadPromise) {
    return loadPromise;
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const loader = getGoogleMapsLoader();
  loadPromise = loader.load();

  return loadPromise;
}

/**
 * Check if Google Maps API is already loaded
 */
export function isGoogleMapsLoaded(): boolean {
  return !!(window.google?.maps?.places && window.google?.maps?.geometry);
}

/**
 * Initialize Google Places services
 */
export async function initializeGooglePlacesServices(): Promise<{
  autocompleteService: google.maps.places.AutocompleteService;
  placesService: google.maps.places.PlacesService;
}> {
  await loadGoogleMaps();

  const autocompleteService = new google.maps.places.AutocompleteService();

  // Create a dummy div for PlacesService (it requires a map or div)
  const dummyDiv = document.createElement('div');
  const placesService = new google.maps.places.PlacesService(dummyDiv);

  return {
    autocompleteService,
    placesService,
  };
}
