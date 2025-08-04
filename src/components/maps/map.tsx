"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ChargingStationMarkers } from './charging-station-markers';
import { MapControls } from './map-controls';
import { RouteVisualization } from './route-visualization';

import { getMapStyle, MapTheme } from '@/lib/maps/map-themes';
import { useMapContext } from '@/lib/contexts/map-context';
import { useNavigation } from '@/lib/contexts/navigation-context';

// Utility function to decode Google Maps polyline
function decodePolyline(encoded: string): google.maps.LatLng[] {
  const poly: google.maps.LatLng[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push(new google.maps.LatLng(lat / 1e5, lng / 1e5));
  }

  return poly;
}

interface POIMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: 'origin' | 'destination' | 'poi';
}

// Google Maps Directions API response interfaces
interface DirectionsResponse {
  geocoded_waypoints: GeocodedWaypoint[];
  routes: DirectionsRoute[];
  status: string;
}

interface DirectionsRoute {
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: Polyline;
  summary: string;
  warnings: any[];
  waypoint_order: any[];
}

interface Leg {
  distance: Distance;
  duration: Distance;
  duration_in_traffic: Distance;
  end_address: string;
  end_location: LatLng;
  start_address: string;
  start_location: LatLng;
  steps: Step[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}

interface Step {
  distance: Distance;
  duration: Distance;
  end_location: LatLng;
  html_instructions: string;
  polyline: Polyline;
  start_location: LatLng;
  travel_mode: string;
}

interface Polyline {
  points: string;
}

interface Distance {
  text: string;
  value: number;
}

interface Bounds {
  northeast: LatLng;
  southwest: LatLng;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface GeocodedWaypoint {
  geocoder_status: string;
  place_id: string;
  types: string[];
}

interface MapProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  routeData?: DirectionsResponse | DirectionsRoute;
  stations?: { id: string; name: string; longitude: number; latitude: number; status: 'available' | 'occupied' | 'offline' }[];
  poiMarkers?: POIMarker[];
  fitToMarkers?: boolean;
  theme?: MapTheme;
  showControls?: boolean;
  onMarkerClick?: (marker: POIMarker) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  onStationClick?: (stationId: string) => void;
  clickMode?: 'none' | 'origin' | 'destination';
}

export function Map({
  initialLng = -86.7816,
  initialLat = 36.1627,
  initialZoom = 7,
  routeData,
  stations = [],
  poiMarkers = [],
  fitToMarkers = false,
  theme: propTheme,
  showControls = true,
  onMarkerClick,
  onMapClick,
  onStationClick,
  clickMode = 'none'
}: MapProps) {
  const { theme } = useMapContext();

  // Make navigation optional - only use if NavigationProvider is available
  let currentLocation = null;
  let isNavigating = false;

  try {
    const navigation = useNavigation();
    currentLocation = navigation.currentLocation;
    isNavigating = navigation.isNavigating;
  } catch (error) {
    // NavigationProvider not available, use default values
    console.log('NavigationProvider not available, navigation features disabled');
  }
  const mapTheme = propTheme || theme;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const poiMarkersRef = useRef<google.maps.Marker[]>([]);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const initializeMap = async () => {
      try {
        const { loadGoogleMaps } = await import('@/lib/maps/google-maps-loader');
        await loadGoogleMaps();

        if (mapContainer.current) {
          const mapOptions: google.maps.MapOptions = {
            center: { lat: 36.8008, lng: 10.1815 }, // Tunis center
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: false,
            clickableIcons: true,
            gestureHandling: 'greedy',
            styles: [
              {
                featureType: 'poi.business',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#f5f1e6' }],
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{ color: '#fdfcf8' }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#f8f5f0' }],
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#757575' }],
              },
              {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#c5dac6' }],
              },
              {
                featureType: 'water',
                elementType: 'all',
                stylers: [{ color: '#46bcec' }, { visibility: 'on' }],
              },
            ],
          };

          map.current = new google.maps.Map(mapContainer.current, mapOptions);

          // Add event listeners for map changes
          map.current.addListener('center_changed', () => {
            if (map.current) {
              const center = map.current.getCenter();
              if (center) {
                setLng(parseFloat(center.lng().toFixed(4)));
                setLat(parseFloat(center.lat().toFixed(4)));
              }
            }
          });

          map.current.addListener('zoom_changed', () => {
            if (map.current) {
              setZoom(map.current.getZoom() || zoom);
            }
          });

          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();

    return () => {
      map.current = null;
      setIsLoaded(false);
    };
  }, [initialLng, initialLat, initialZoom, mapTheme]);

  // Route rendering is now handled by RouteVisualization component

  // Update map theme when theme prop changes
  // useEffect(() => {
  //   if (map.current && isLoaded) {
  //     map.current.setOptions({
  //       styles: getMapStyle(mapTheme)
  //     });
  //   }
  // }, [mapTheme, isLoaded]);

  // Route rendering is now handled by RouteVisualization component

  // Handle POI markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing POI markers
    poiMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    poiMarkersRef.current = [];

    // Add new POI markers
    const newMarkers = poiMarkers.map(poi => {
      // Import marker icons dynamically
      const getMarkerIcon = async () => {
        const { getMarkerIcon: getIcon } = await import('@/lib/maps/marker-icons');
        return getIcon(poi.type);
      };

      const marker = new google.maps.Marker({
        position: { lat: poi.latitude, lng: poi.longitude },
        map: map.current,
        title: poi.name,
        animation: google.maps.Animation.DROP
      });

      // Set icon asynchronously
      getMarkerIcon().then(icon => {
        marker.setIcon(icon);
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${poi.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${poi.type === 'origin' ? 'Starting Point' :
            poi.type === 'destination' ? 'Destination' : 'Point of Interest'}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        poiMarkersRef.current.forEach(m => {
          const existingInfoWindow = (m as any).infoWindow;
          if (existingInfoWindow) {
            existingInfoWindow.close();
          }
        });

        infoWindow.open(map.current, marker);
        if (onMarkerClick) {
          onMarkerClick(poi);
        }
      });

      // Store info window reference
      (marker as any).infoWindow = infoWindow;

      // Add click listener
      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(poi));
      }

      return marker;
    });

    poiMarkersRef.current = newMarkers;

    // Fit map to show all markers if requested
    if (fitToMarkers && poiMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      poiMarkers.forEach(poi => {
        bounds.extend({ lat: poi.latitude, lng: poi.longitude });
      });

      // Also include stations in bounds if they exist
      stations.forEach(station => {
        bounds.extend({ lat: station.latitude, lng: station.longitude });
      });

      map.current.fitBounds(bounds);

      // Set a maximum zoom level to prevent over-zooming on single markers
      const listener = google.maps.event.addListener(map.current, 'bounds_changed', () => {
        if (map.current && map.current.getZoom() && map.current.getZoom()! > 15) {
          map.current.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [poiMarkers, fitToMarkers, stations, isLoaded, onMarkerClick]);

  // Handle map click events for setting origin/destination
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing click listener
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current);
      mapClickListenerRef.current = null;
    }

    // Add click listener if onMapClick is provided and clickMode is not 'none'
    if (onMapClick && clickMode !== 'none') {
      mapClickListenerRef.current = map.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick({ lat, lng });
        }
      });

      // Update cursor style based on click mode
      const mapDiv = map.current.getDiv();
      if (mapDiv) {
        mapDiv.style.cursor = clickMode === 'origin' ? 'crosshair' :
          clickMode === 'destination' ? 'crosshair' : 'default';
      }
    } else {
      // Reset cursor to default
      const mapDiv = map.current.getDiv();
      if (mapDiv) {
        mapDiv.style.cursor = 'default';
      }
    }

    // Cleanup function
    return () => {
      if (mapClickListenerRef.current) {
        google.maps.event.removeListener(mapClickListenerRef.current);
        mapClickListenerRef.current = null;
      }
    };
  }, [onMapClick, clickMode, isLoaded]);

  // Handle current location marker during navigation
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing current location marker
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
    }

    // Add current location marker if navigating and location is available
    if (isNavigating && currentLocation) {
      currentLocationMarkerRef.current = new google.maps.Marker({
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        map: map.current,
        title: 'Your Current Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          scale: 8,
        },
        zIndex: 1000 // Ensure it appears above other markers
      });

      // Add accuracy circle if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          if (position.coords.accuracy && currentLocationMarkerRef.current) {
            new google.maps.Circle({
              strokeColor: '#4285F4',
              strokeOpacity: 0.3,
              strokeWeight: 1,
              fillColor: '#4285F4',
              fillOpacity: 0.1,
              map: map.current,
              center: { lat: currentLocation.lat, lng: currentLocation.lng },
              radius: position.coords.accuracy
            });
          }
        });
      }

      // Center map on current location during navigation
      if (isNavigating) {
        map.current.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
      }
    }

    // Cleanup function
    return () => {
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }
    };
  }, [currentLocation, isNavigating, isLoaded]);

  return (
    <div className="relative w-full h-full min-h-[400px] sm:min-h-[500px]">
      <div ref={mapContainer} className="map-container w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600 text-sm sm:text-base">Loading map...</div>
        </div>
      )}

      {/* Click mode indicator - Responsive */}
      {clickMode !== 'none' && (
        <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg max-w-[90vw]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium">
              Click map to set {clickMode === 'origin' ? 'start' : 'destination'}
            </span>
          </div>
        </div>
      )}

      {/* Map coordinates - Hidden on mobile */}
      <div className="hidden sm:block absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow-md text-xs">
        Lng: {lng} | Lat: {lat} | Zoom: {zoom}
      </div>

      {isLoaded && (
        <>
          {console.log('Map component - isLoaded:', isLoaded)}
          {console.log('Map component - map.current:', map.current)}
          {console.log('Map component - stations:', stations)}
          {console.log('Map component - stations length:', stations?.length)}
          {console.log('Map component - onStationClick:', onStationClick)}
          <ChargingStationMarkers
            map={map.current}
            stations={stations}
            onStationClick={onStationClick}
          />
          {routeData && (
            <RouteVisualization
              map={map.current}
              route={routeData}
              onStationClick={onStationClick}
            />
          )}
        </>
      )}
      {isLoaded && showControls && <MapControls map={map.current} route={routeData} />}
    </div>
  );
}