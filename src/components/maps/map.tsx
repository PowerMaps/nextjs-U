"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ChargingStationMarkers } from './charging-station-markers';
import { MapControls } from './map-controls';

import { getMapStyle, MapTheme } from '@/lib/maps/map-themes';
import { useMapContext } from '@/lib/contexts/map-context';

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
  const mapTheme = propTheme || theme;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const poiMarkersRef = useRef<google.maps.Marker[]>([]);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const initializeMap = async () => {
      try {
        const { loadGoogleMaps } = await import('@/lib/maps/google-maps-loader');
        await loadGoogleMaps();

        if (mapContainer.current) {
          map.current = new google.maps.Map(mapContainer.current, {
            center: { lat, lng },
            zoom: zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: getMapStyle(mapTheme),
            gestureHandling: 'cooperative',
            clickableIcons: false,
          });

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

  const routePolylineRef = useRef<google.maps.Polyline | null>(null);

  // Update map theme when theme prop changes
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setOptions({
        styles: getMapStyle(mapTheme)
      });
    }
  }, [mapTheme, isLoaded]);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing route
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    console.log('Route data received:', routeData);

    if (routeData) {
      let route: DirectionsRoute | null = null;

      // Handle both DirectionsResponse and DirectionsRoute formats
      if ('routes' in routeData && routeData.routes.length > 0) {
        route = routeData.routes[0]; // Use first route
        console.log('Using first route from routes array:', route);
      } else if ('overview_polyline' in routeData) {
        route = routeData as DirectionsRoute;
        console.log('Using route data directly:', route);
      } else {
        // Handle case where routeData might be GeoJSON or other format
        console.log('Route data format not recognized, attempting GeoJSON fallback');
        if (routeData && typeof routeData === 'object' && 'geometry' in routeData) {
          const geoJsonRoute = routeData as any;
          if (geoJsonRoute.geometry && geoJsonRoute.geometry.coordinates) {
            console.log('Rendering GeoJSON route');
            const path = geoJsonRoute.geometry.coordinates.map(([lng, lat]: [number, number]) => ({
              lat,
              lng
            }));

            routePolylineRef.current = new google.maps.Polyline({
              path,
              geodesic: true,
              strokeColor: '#4285F4',
              strokeOpacity: 1.0,
              strokeWeight: 4,
            });

            routePolylineRef.current.setMap(map.current);
            return;
          }
        }
      }

      if (route && route.overview_polyline && route.overview_polyline.points) {
        console.log('Decoding polyline points:', route.overview_polyline.points);
        // Decode the polyline points
        const decodedPath = decodePolyline(route.overview_polyline.points);
        console.log('Decoded path length:', decodedPath.length);

        routePolylineRef.current = new google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: '#4285F4',
          strokeOpacity: 1.0,
          strokeWeight: 4,
        });

        routePolylineRef.current.setMap(map.current);
        console.log('Polyline added to map');

        // Fit map to route bounds if available
        if (route.bounds) {
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(route.bounds.southwest.lat, route.bounds.southwest.lng),
            new google.maps.LatLng(route.bounds.northeast.lat, route.bounds.northeast.lng)
          );
          map.current.fitBounds(bounds);
          console.log('Map fitted to route bounds');
        }
      } else {
        console.log('No valid route or polyline data found');
      }
    }
  }, [routeData, isLoaded]);

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

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="map-container w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}

      {/* Click mode indicator */}
      {clickMode !== 'none' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Click on the map to set {clickMode === 'origin' ? 'starting point' : 'destination'}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow-md text-sm">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      {isLoaded && (
        <>
          {console.log('Rendering stations:', stations)}
          <ChargingStationMarkers 
            map={map.current} 
            stations={stations}
            onStationClick={onStationClick}
          />
        </>
      )}
      {isLoaded && showControls && <MapControls map={map.current} />}
    </div>
  );
}