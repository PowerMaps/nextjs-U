"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ChargingStationMarkers } from './charging-station-markers';
import { MapControls } from './map-controls';
import { Loader } from '@googlemaps/js-api-loader';
import { getMapStyle, MapTheme } from '@/lib/maps/map-themes';
import { useMapContext } from '@/lib/contexts/map-context';

interface MapProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  routeGeoJSON?: GeoJSON.Feature<GeoJSON.LineString>;
  stations?: { id: string; name: string; longitude: number; latitude: number; status: 'available' | 'occupied' | 'offline' }[];
  theme?: MapTheme;
  showControls?: boolean;
}

export function Map({ 
  initialLng = -86.7816, 
  initialLat = 36.1627, 
  initialZoom = 7, 
  routeGeoJSON, 
  stations = [], 
  theme: propTheme,
  showControls = true 
}: MapProps) {
  const { theme } = useMapContext();
  const mapTheme = propTheme || theme;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
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
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });

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

    if (routeGeoJSON && routeGeoJSON.geometry.coordinates) {
      // Convert GeoJSON coordinates to Google Maps LatLng format
      const path = routeGeoJSON.geometry.coordinates.map(([lng, lat]) => ({
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
    }
  }, [routeGeoJSON, isLoaded]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="map-container w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow-md text-sm">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      {isLoaded && <ChargingStationMarkers map={map.current} stations={stations} />}
      {isLoaded && showControls && <MapControls map={map.current} />}
    </div>
  );
}