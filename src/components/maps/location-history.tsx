"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Location {
  name: string;
  longitude: number;
  latitude: number;
}

interface LocationHistoryProps {
  onSelectLocation: (location: Location) => void;
}

const RECENT_LOCATIONS_KEY = 'recent_locations';
const SAVED_LOCATIONS_KEY = 'saved_locations';

export function LocationHistory({ onSelectLocation }: LocationHistoryProps) {
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRecent = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (storedRecent) {
        setRecentLocations(JSON.parse(storedRecent));
      }
      const storedSaved = localStorage.getItem(SAVED_LOCATIONS_KEY);
      if (storedSaved) {
        setSavedLocations(JSON.parse(storedSaved));
      }
    }
  }, []);

  const addRecentLocation = (location: Location) => {
    if (typeof window === 'undefined') return;
    const updatedRecent = [location, ...recentLocations.filter(loc => loc.name !== location.name)].slice(0, 5); // Keep last 5
    setRecentLocations(updatedRecent);
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updatedRecent));
  };

  const addSavedLocation = (location: Location) => {
    if (typeof window === 'undefined') return;
    if (savedLocations.some(loc => loc.name === location.name)) {
      toast({
        title: "Location already saved",
        description: "This location is already in your saved list.",
        variant: "destructive",
      });
      return;
    }
    const updatedSaved = [...savedLocations, location];
    setSavedLocations(updatedSaved);
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updatedSaved));
    toast({
      title: "Location saved",
      description: `${location.name} has been added to your saved locations.`,
    });
  };

  const removeSavedLocation = (locationName: string) => {
    if (typeof window === 'undefined') return;
    const updatedSaved = savedLocations.filter(loc => loc.name !== locationName);
    setSavedLocations(updatedSaved);
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updatedSaved));
    toast({
      title: "Location removed",
      description: `${locationName} has been removed from your saved locations.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentLocations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Recent Locations</h3>
            <ul className="space-y-2">
              {recentLocations.map((loc, index) => (
                <li key={index} className="flex items-center justify-between">
                  <Button variant="ghost" className="justify-start flex-grow" onClick={() => onSelectLocation(loc)}>
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {loc.name}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => addSavedLocation(loc)}>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {savedLocations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Saved Locations</h3>
            <ul className="space-y-2">
              {savedLocations.map((loc, index) => (
                <li key={index} className="flex items-center justify-between">
                  <Button variant="ghost" className="justify-start flex-grow" onClick={() => onSelectLocation(loc)}>
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {loc.name}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeSavedLocation(loc.name)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recentLocations.length === 0 && savedLocations.length === 0 && (
          <p className="text-muted-foreground">No recent or saved locations.</p>
        )}
      </CardContent>
    </Card>
  );
}