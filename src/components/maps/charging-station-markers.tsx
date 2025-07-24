"use client";

import React, { useEffect, useRef } from 'react';

interface ChargingStation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  status: 'available' | 'occupied' | 'offline';
}

interface ChargingStationMarkersProps {
  map: google.maps.Map | null;
  stations: ChargingStation[];
}

const getMarkerColor = (status: ChargingStation['status']) => {
  switch (status) {
    case 'available':
      return '#4CAF50'; // Green
    case 'occupied':
      return '#FFC107'; // Amber
    case 'offline':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
};

const createMarkerIcon = (color: string) => {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: 8,
  };
};

export function ChargingStationMarkers({ map, stations }: ChargingStationMarkersProps) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Close existing info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    // Add new markers
    stations.forEach(station => {
      const marker = new google.maps.Marker({
        position: { lat: station.latitude, lng: station.longitude },
        map: map,
        title: station.name,
        icon: createMarkerIcon(getMarkerColor(station.status)),
      });

      // Add click listener for info window
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div>
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${station.name}</h3>
              <p style="margin: 0; font-size: 14px;">Status: <span style="color: ${getMarkerColor(station.status)}; font-weight: bold;">${station.status}</span></p>
            </div>
          `);
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [map, stations]);

  return null;
}