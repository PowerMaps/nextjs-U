"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MapTheme } from '@/lib/maps/map-themes';

interface MapContextType {
  theme: MapTheme;
  setTheme: (theme: MapTheme) => void;
  showTraffic: boolean;
  setShowTraffic: (show: boolean) => void;
  showTransit: boolean;
  setShowTransit: (show: boolean) => void;
  mapType: google.maps.MapTypeId;
  setMapType: (type: google.maps.MapTypeId) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
  initialTheme?: MapTheme;
}

export function MapProvider({ children, initialTheme = 'light' }: MapProviderProps) {
  const [theme, setTheme] = useState<MapTheme>(initialTheme);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [mapType, setMapType] = useState<google.maps.MapTypeId>('roadmap' as google.maps.MapTypeId);

  const value: MapContextType = {
    theme,
    setTheme,
    showTraffic,
    setShowTraffic,
    showTransit,
    setShowTransit,
    mapType,
    setMapType,
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}