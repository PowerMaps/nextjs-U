"use client";

import React, { useEffect, useRef } from 'react';

interface ChargingStation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  status: 'available' | 'occupied' | 'offline';
  isUserOwned?: boolean;
}

interface ChargingStationMarkersProps {
  map: google.maps.Map | null;
  stations: ChargingStation[];
  onStationClick?: (stationId: string) => void;
}

const getMarkerColor = (status: ChargingStation['status'], isUserOwned?: boolean) => {
  if (isUserOwned) {
    return '#2196F3'; // Blue for user-owned stations
  }
  
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

export function ChargingStationMarkers({ map, stations, onStationClick }: ChargingStationMarkersProps) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    console.log('ChargingStationMarkers - map:', map);
    console.log('ChargingStationMarkers - stations:', stations);
    console.log('ChargingStationMarkers - stations count:', stations.length);
    
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Close existing info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow({
      maxWidth: 300,
    });

    // Add new markers
    console.log('Creating markers for stations:', stations);
    stations.forEach((station, index) => {
      console.log(`Creating marker ${index + 1}:`, station);
      const marker = new google.maps.Marker({
        position: { lat: typeof  station.latitude == 'string' ? Number(station.latitude) :station.latitude, lng: typeof station.longitude == 'string'?Number(station.longitude): station.longitude },
        map: map,
        title: station.name,
        icon: createMarkerIcon(getMarkerColor(station.status, station.isUserOwned)),
      });

      // Add click listener for info window
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          const statusColor = getMarkerColor(station.status, station.isUserOwned);
          const statusText = station.status.charAt(0).toUpperCase() + station.status.slice(1);
          
          infoWindowRef.current.setContent(`
            <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; flex: 1;">${station.name}</h3>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="
                  display: inline-flex; 
                  align-items: center; 
                  gap: 4px;
                  padding: 4px 8px; 
                  border-radius: 12px; 
                  font-size: 12px; 
                  font-weight: 500;
                  background-color: ${statusColor}20;
                  color: ${statusColor};
                  border: 1px solid ${statusColor}40;
                ">
                  <span style="
                    width: 6px; 
                    height: 6px; 
                    border-radius: 50%; 
                    background-color: ${statusColor};
                  "></span>
                  ${statusText}
                </span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
                  Click "View Details" to see connector availability and book a charging session.
                </p>
              </div>
              
              <div style="display: flex; gap: 8px;">
                <button 
                  onclick="window.handleStationDetailsClick('${station.id}')"
                  style="
                    flex: 1;
                    padding: 8px 16px;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                  "
                  onmouseover="this.style.backgroundColor='#2563eb'"
                  onmouseout="this.style.backgroundColor='#3b82f6'"
                >
                  View Details & Book
                </button>
              </div>
            </div>
          `);
          
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
      console.log(`Marker ${index + 1} created and added to map`);
    });
    
    console.log(`Total markers created: ${markersRef.current.length}`);

    // Set up global handler for station details click
    (window as any).handleStationDetailsClick = (stationId: string) => {
      console.log('Station clicked:', stationId);
      if (onStationClick) {
        console.log('Calling onStationClick with:', stationId);
        onStationClick(stationId);
      } else {
        console.log('No onStationClick handler provided');
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      // Clean up global handler
      delete (window as any).handleStationDetailsClick;
    };
  }, [map, stations, onStationClick]);

  return null;
}