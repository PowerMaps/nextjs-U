"use client";

import { useState, useEffect } from 'react';

export interface LocationItem {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  type: 'recent' | 'saved';
  timestamp?: number;
}

const RECENT_LOCATIONS_KEY = 'recent_locations';
const SAVED_LOCATIONS_KEY = 'saved_locations';
const MAX_RECENT_LOCATIONS = 10;

export function useLocationHistory() {
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>([]);
  const [savedLocations, setSavedLocations] = useState<LocationItem[]>([]);

  // Load locations from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const recent = localStorage.getItem(RECENT_LOCATIONS_KEY);
      const saved = localStorage.getItem(SAVED_LOCATIONS_KEY);
      
      if (recent) {
        try {
          setRecentLocations(JSON.parse(recent));
        } catch (error) {
          console.error('Error parsing recent locations:', error);
        }
      }
      
      if (saved) {
        try {
          setSavedLocations(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing saved locations:', error);
        }
      }
    }
  }, []);

  const addRecentLocation = (location: Omit<LocationItem, 'id' | 'type' | 'timestamp'>) => {
    const newLocation: LocationItem = {
      ...location,
      id: `recent_${Date.now()}`,
      type: 'recent',
      timestamp: Date.now()
    };

    setRecentLocations(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => 
        !(item.name === location.name && 
          Math.abs(item.latitude - location.latitude) < 0.0001 && 
          Math.abs(item.longitude - location.longitude) < 0.0001)
      );
      
      // Add to beginning and limit to MAX_RECENT_LOCATIONS
      const updated = [newLocation, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  const saveLocation = (location: Omit<LocationItem, 'id' | 'type'>) => {
    const newLocation: LocationItem = {
      ...location,
      id: `saved_${Date.now()}`,
      type: 'saved'
    };

    setSavedLocations(prev => {
      // Check if already saved
      const exists = prev.some(item => 
        item.name === location.name && 
        Math.abs(item.latitude - location.latitude) < 0.0001 && 
        Math.abs(item.longitude - location.longitude) < 0.0001
      );
      
      if (exists) {
        return prev;
      }
      
      const updated = [...prev, newLocation];
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  const removeSavedLocation = (id: string) => {
    setSavedLocations(prev => {
      const updated = prev.filter(item => item.id !== id);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  const clearRecentLocations = () => {
    setRecentLocations([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_LOCATIONS_KEY);
    }
  };

  const isLocationSaved = (location: { name: string; latitude: number; longitude: number }) => {
    return savedLocations.some(item => 
      item.name === location.name && 
      Math.abs(item.latitude - location.latitude) < 0.0001 && 
      Math.abs(item.longitude - location.longitude) < 0.0001
    );
  };

  return {
    recentLocations,
    savedLocations,
    addRecentLocation,
    saveLocation,
    removeSavedLocation,
    clearRecentLocations,
    isLocationSaved
  };
}