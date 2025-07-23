'use client';

import { useChargingStations, useNearbyStations, useToggleFavoriteStation } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNetworkStatus } from '@/lib/api/hooks';

export function StationListExample() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { data: stations, isLoading, error } = useChargingStations({
    page: 1,
    limit: 10,
  });
  const { data: nearbyStations } = useNearbyStations(
    userLocation?.lat || 0,
    userLocation?.lng || 0,
    10
  );
  const toggleFavorite = useToggleFavoriteStation();
  const { isOnline } = useNetworkStatus();

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleToggleFavorite = (stationId: string) => {
    if (!isOnline) {
      return;
    }
    toggleFavorite.mutate({ stationId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-100">
        <h3 className="text-lg font-medium">Error loading stations</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Charging Stations</h2>
          <Button onClick={getUserLocation} variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Find Nearby
          </Button>
        </div>

        {!isOnline && (
          <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            You are currently offline. Showing cached data.
          </div>
        )}

        {/* Nearby Stations */}
        {nearbyStations && nearbyStations.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold">Nearby Stations</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyStations.slice(0, 3).map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onToggleFavorite={handleToggleFavorite}
                  isOnline={isOnline}
                  isToggling={toggleFavorite.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Stations */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">All Stations</h3>
          {stations?.items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No charging stations found.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stations?.items.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onToggleFavorite={handleToggleFavorite}
                  isOnline={isOnline}
                  isToggling={toggleFavorite.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StationCardProps {
  station: any;
  onToggleFavorite: (stationId: string) => void;
  isOnline: boolean;
  isToggling: boolean;
}

function StationCard({ station, onToggleFavorite, isOnline, isToggling }: StationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-100';
      case 'LIMITED':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100';
      case 'MAINTENANCE':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-100';
      case 'OFFLINE':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-100';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md">
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h4 className="font-medium">{station.name}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(station.id)}
            disabled={!isOnline || isToggling}
            className="h-8 w-8 p-0"
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="mb-2 text-sm text-muted-foreground">{station.address}</p>
        
        <div className="mb-3 flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(station.status)}`}>
            {station.status}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Zap className="mr-1 h-3 w-3" />
            {station.connectors?.length || 0} connectors
          </div>
        </div>

        {station.rating && (
          <div className="mb-3 flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(station.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              {station.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" className="flex-1" disabled={!isOnline}>
            Navigate
          </Button>
        </div>
      </div>
    </div>
  );
}