"use client";

import React, { useState, useEffect } from 'react';

import { RouteStatisticsPanel } from '@/components/maps/route-statistics-panel';
import { Map } from '@/components/maps/map';
import { StationDetailsSidebar } from '@/components/maps/station-details-sidebar';
import {
  useCalculateRoute
} from '@/lib/api/hooks/routing-hooks';
import {
  useNearbyStations
} from '@/lib/api/hooks/station-hooks';
import { useVehicles } from '@/lib/api/hooks/vehicle-hooks';
import { RouteRequestDto, Coordinates, VehicleResponseDto } from '@/lib/api/types';
import { EVRouteResponse, ChargingStation } from './route-interfaces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Route, Zap, X, ArrowLeft, Menu,
  MapPin,
  Navigation,
  Locate,
  AlertCircle
} from 'lucide-react';
import { MapProvider } from '@/lib/contexts/map-context';
import { NavigationProvider, useNavigation } from '@/lib/contexts/navigation-context';
import { NavigationPanel } from '@/components/maps/navigation-panel';
import { NavigationInstructionOverlay } from '@/components/maps/navigation-instruction-overlay';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { metadata } from '@/app/layout';
import { UnifiedAddressInput } from '@/components/maps/unified-address-input';

interface AddressResult {
  name: string;
  latitude: number;
  longitude: number;
  type: 'search' | 'current_location';
}

function MapPageContent() {
  // State for route planning
  const [origin, setOrigin] = useState<string | Coordinates>('');
  const [destination, setDestination] = useState<string | Coordinates>('');
  const [originDisplay, setOriginDisplay] = useState<string>('');
  const [destinationDisplay, setDestinationDisplay] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [currentRoute, setCurrentRoute] = useState<EVRouteResponse | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 32.7128, lng: 10.0060 }); // Default to Tunisia
  const [poiMarkers, setPoiMarkers] = useState<Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type?: 'origin' | 'destination' | 'poi';
  }>>([]);
  const [clickMode, setClickMode] = useState<'none' | 'origin' | 'destination'>('none');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showPanels, setShowPanels] = useState<boolean>(true);

  // API hooks
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: nearbyStations } = useNearbyStations(mapCenter.lat, mapCenter.lng, 25);
  const calculateRoute = useCalculateRoute();
  const { toast } = useToast();

  // Navigation hooks
  const navigation = useNavigation();

  // Debug nearby stations data
  useEffect(() => {
    if (nearbyStations) {
      console.log('Nearby stations data:', nearbyStations);
      console.log('First station structure:', nearbyStations[0]);
    }
  }, [nearbyStations]);

  // Set default vehicle when vehicles are loaded
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
      const defaultVehicle = vehicles.find(v => v.nickname?.includes('default')) || vehicles[0];
      setSelectedVehicleId(defaultVehicle.id);
    }
  }, [vehicles, selectedVehicleId]);

  // Handle route calculation
  const handleCalculateRoute = async () => {
    console.log('handleCalculateRoute called');
    console.log('origin:', origin);
    console.log('destination:', destination);
    console.log('selectedVehicleId:', selectedVehicleId);
    
    if (!origin || !destination || !selectedVehicleId) {
      console.log('Missing required data for route calculation');
      toast({
        title: "Missing information",
        description: "Please set both origin and destination points",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have both origin and destination markers for route calculation
    const originCoords = typeof origin === 'string' ? null : origin;
    const destCoords = typeof destination === 'string' ? null : destination;

    if (originCoords && destCoords) {
      // Update POI markers to include both origin and destination
      setPoiMarkers(prev => {
        const filtered = prev.filter(marker => marker.type !== 'origin' && marker.type !== 'destination');
        return [
          ...filtered,
          {
            id: 'origin',
            name: originDisplay || 'Starting Point',
            latitude: originCoords.lat,
            longitude: originCoords.lng,
            type: 'origin' as const
          },
          {
            id: 'destination',
            name: destinationDisplay || 'Destination',
            latitude: destCoords.lat,
            longitude: destCoords.lng,
            type: 'destination' as const
          }
        ];
      });
    }

    const routeRequest: RouteRequestDto = {
      origin,
      destination,
      vehicleId: selectedVehicleId,
      routeConfig: {
        considerWeather: true,
        considerTraffic: true,
        priorityMode: 'balanced',
        includeAlternatives: true,
      },
    };

    try {
      console.log('Sending route request:', routeRequest);
      const result = await calculateRoute.mutateAsync(routeRequest);
      console.log('Route calculation result:', result);
      setCurrentRoute(result);
      setRouteDetails(result);
      
      toast({
        title: "Route calculated",
        description: `Found route with ${result.chargingStations?.length || 0} charging stops`,
      });

    } catch (error) {
      console.error('Route calculation failed:', error);
      toast({
        title: "Route calculation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle origin selection from unified input
  const handleOriginSelect = (addressResult: AddressResult) => {
    const coordinates: Coordinates = { lat: addressResult.latitude, lng: addressResult.longitude };
    setOrigin(coordinates);
    setOriginDisplay(addressResult.name);
    setMapCenter(coordinates);

    // Add or update origin marker
    setPoiMarkers(prev => {
      const filtered = prev.filter(marker => marker.type !== 'origin');
      return [...filtered, {
        id: 'origin',
        name: addressResult.name,
        latitude: addressResult.latitude,
        longitude: addressResult.longitude,
        type: 'origin' as const
      }];
    });

    // Show appropriate toast based on selection type
    if (addressResult.type === 'current_location') {
      toast({
        title: "Current location set",
        description: "Using your current location as starting point",
      });
    } else {
      toast({
        title: "Origin set",
        description: `Starting point: ${addressResult.name}`,
      });
    }
  };

  // Handle destination selection from unified input
  const handleDestinationSelect = (addressResult: AddressResult) => {
    const coordinates: Coordinates = { lat: addressResult.latitude, lng: addressResult.longitude };
    setDestination(coordinates);
    setDestinationDisplay(addressResult.name);

    // Add or update destination marker
    setPoiMarkers(prev => {
      const filtered = prev.filter(marker => marker.type !== 'destination');
      return [...filtered, {
        id: 'destination',
        name: addressResult.name,
        latitude: addressResult.latitude,
        longitude: addressResult.longitude,
        type: 'destination' as const
      }];
    });

    toast({
      title: "Destination set",
      description: `Destination: ${addressResult.name}`,
    });
  };

  // Handle map click to set origin or destination
  const handleMapClick = async (coordinates: { lat: number; lng: number }) => {
    try {
      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode(
          { location: { lat: coordinates.lat, lng: coordinates.lng } },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve({ results } as google.maps.GeocoderResponse);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      const address = response.results?.[0]?.formatted_address || `${coordinates.lat}, ${coordinates.lng}`;

      if (clickMode === 'origin') {
        const coords: Coordinates = { lat: coordinates.lat, lng: coordinates.lng };
        setOrigin(coords);
        setOriginDisplay(address);
        setMapCenter(coords);

        // Add origin marker
        setPoiMarkers(prev => {
          const filtered = prev.filter(marker => marker.type !== 'origin');
          return [...filtered, {
            id: 'origin',
            name: address,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            type: 'origin' as const
          }];
        });

        // Reset click mode
        setClickMode('none');

        toast({
          title: "Origin set",
          description: `Starting point set to: ${address}`,
        });

      } else if (clickMode === 'destination') {
        const coords: Coordinates = { lat: coordinates.lat, lng: coordinates.lng };
        setDestination(coords);
        setDestinationDisplay(address);

        // Add destination marker
        setPoiMarkers(prev => {
          const filtered = prev.filter(marker => marker.type !== 'destination');
          return [...filtered, {
            id: 'destination',
            name: address,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            type: 'destination' as const
          }];
        });

        // Reset click mode
        setClickMode('none');

        toast({
          title: "Destination set",
          description: `Destination set to: ${address}`,
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);

      // Fallback: use coordinates as name
      const fallbackName = `${coordinates.lat}, ${coordinates.lng}`;

      if (clickMode === 'origin') {
        const coords: Coordinates = { lat: coordinates.lat, lng: coordinates.lng };
        setOrigin(coords);
        setOriginDisplay(fallbackName);
        setMapCenter(coords);

        setPoiMarkers(prev => {
          const filtered = prev.filter(marker => marker.type !== 'origin');
          return [...filtered, {
            id: 'origin',
            name: fallbackName,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            type: 'origin' as const
          }];
        });
      } else if (clickMode === 'destination') {
        const coords: Coordinates = { lat: coordinates.lat, lng: coordinates.lng };
        setDestination(coords);
        setDestinationDisplay(fallbackName);

        setPoiMarkers(prev => {
          const filtered = prev.filter(marker => marker.type !== 'destination');
          return [...filtered, {
            id: 'destination',
            name: fallbackName,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            type: 'destination' as const
          }];
        });
      }

      setClickMode('none');
    }
  };

  // Clear all POI markers
  const clearMarkers = () => {
    setPoiMarkers([]);
    setOrigin('');
    setDestination('');
    setOriginDisplay('');
    setDestinationDisplay('');
    setCurrentRoute(null);
    setClickMode('none');
  };

  // Format route statistics
  const getRouteStats = () => {
    if (!routeDetails?.analysis) {
      return {
        distance: '-- km',
        duration: '-- min',
        energyConsumption: '-- kWh',
        estimatedCost: '-- €',
        chargingTime: '-- min',
        batteryLevel: '-- %',
      };
    }

    const { analysis } = routeDetails;

    return {
      distance: `${Math.round(analysis.totalDistance)} km`,
      duration: `${Math.round(analysis.totalTime)} min`,
      energyConsumption: `${analysis.energyConsumption} kWh`,
      estimatedCost: `${analysis.estimatedCost} €`,
      chargingTime: `${Math.round(analysis.chargingTime)} min`,
      batteryLevel: `${analysis.batteryLevelAtDestination}%`,
    };
  };

  const routeStats = getRouteStats();

  return (
    <>
      {/* Mobile-first full-screen map container */}
      <div className={`relative h-screen overflow-hidden bg-gray-100 transition-all duration-300 ${
        selectedStationId ? 'lg:w-[calc(100vw-320px)]' : 'w-screen'
      }`}>
        {/* Main Map */}
        <Map
          key={selectedStationId ? 'with-sidebar' : 'without-sidebar'}
          initialLat={mapCenter.lat}
          initialLng={mapCenter.lng}
          routeData={currentRoute?.route}
          stations={(() => {
            // Handle route charging stations first
            if (currentRoute?.chargingStations && currentRoute.chargingStations.length > 0) {
              return currentRoute.chargingStations
                .filter(station => station.latitude != null && station.longitude != null)
                .map(station => ({
                  id: station.id,
                  name: station.name,
                  longitude: station.longitude,
                  latitude: station.latitude,
                  status: station.isActive ? 'available' as const : 'offline' as const
                }));
            }

            // Fallback to nearby stations
            if (nearbyStations && nearbyStations.length > 0) {
              return nearbyStations
                .filter(station => station.latitude != null && station.longitude != null)
                .map(station => ({
                  id: station.id,
                  name: station.name,
                  longitude: station.longitude,
                  latitude: station.latitude,
                  status: station.isActive ? 'available' as const : 'offline' as const
                }));
            }

            return [];
          })()}
          poiMarkers={poiMarkers}
          fitToMarkers={poiMarkers.length > 0}
          onMarkerClick={(marker) => {
            console.log('Marker clicked:', marker);
          }}
          onMapClick={handleMapClick}
          onStationClick={(stationId) => setSelectedStationId(stationId)}
          clickMode={clickMode}
        />

        {/* Navigation Instruction Overlay */}
        <NavigationInstructionOverlay route={currentRoute?.route} />

        {/* Top Navigation Bar - Mobile optimized */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base hidden xs:inline">Back</span>
                <span className="font-medium hidden sm:inline">to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Route className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                <span className="hidden sm:inline">Route Planner</span>
                <span className="sm:hidden">Routes</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowPanels(!showPanels)}
                variant="outline"
                size="sm"
                title={showPanels ? "Hide panels" : "Show panels"}
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
              >
                <Menu className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-2">
                  {showPanels ? 'Hide' : 'Show'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Left Control Panel - Mobile responsive */}
        {showPanels && (
          <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-10 w-[calc(100vw-1rem)] sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto space-y-3 sm:space-y-4">
            {/* Route Planning Section - Mobile optimized */}
            <Card className="shadow-lg bg-blue-50 border-blue-200">
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-blue-800">
                  <Route className="h-4 w-4 text-blue-600" />
                  Route Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 space-y-3">
                {/* Origin Input with Unified Interface */}
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-blue-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Starting Point
                  </label>
                  <UnifiedAddressInput
                    placeholder="Search address or use current location"
                    onSelectAddress={handleOriginSelect}
                    value={originDisplay}
                  />
                </div>

                {/* Destination Input with Unified Interface */}
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-blue-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Destination
                  </label>
                  <UnifiedAddressInput
                    placeholder="Search destination address"
                    onSelectAddress={handleDestinationSelect}
                    value={destinationDisplay}
                  />
                </div>

                {/* Action Buttons - Mobile responsive */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={handleCalculateRoute}
                    disabled={!origin || !destination || !selectedVehicleId || calculateRoute.isPending}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 flex-1 h-9 text-sm"
                  >
                    {calculateRoute.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Route className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Calculate Route</span>
                    <span className="sm:hidden">Calculate</span>
                  </Button>

                  <div className="flex gap-2">
                    {poiMarkers.length > 0 && (
                      <Button
                        onClick={clearMarkers}
                        variant="outline"
                        size="sm"
                        title="Clear all"
                        className="h-9 px-3"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Clear</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Selection - Mobile optimized */}
            <Card className="shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    Vehicle
                  </label>
                  <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehiclesLoading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </SelectItem>
                      ) : (
                        vehicles?.map((vehicle: VehicleResponseDto) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            <span className="truncate">
                              {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Click Mode Controls - Mobile optimized */}
            <Card className="shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Quick Set on Map
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={clickMode === 'origin' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClickMode(clickMode === 'origin' ? 'none' : 'origin')}
                      className="text-xs h-8 px-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      {clickMode === 'origin' ? 'Cancel' : 'Start'}
                    </Button>
                    <Button
                      type="button"
                      variant={clickMode === 'destination' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClickMode(clickMode === 'destination' ? 'none' : 'destination')}
                      className="text-xs h-8 px-2"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      {clickMode === 'destination' ? 'Cancel' : 'End'}
                    </Button>
                  </div>
                  {clickMode !== 'none' && (
                    <p className="text-xs text-muted-foreground text-center">
                      Tap map to set {clickMode === 'origin' ? 'starting point' : 'destination'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Route Info - Mobile optimized */}
            {(origin || destination) && (
              <Card className="shadow-lg">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Route className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      Current Route
                    </label>
                    {origin && typeof origin === 'object' && (
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1"></div>
                        <div className="min-w-0 flex-1">
                          <span className="text-muted-foreground text-xs">From:</span>
                          <div className="truncate font-medium">
                            {originDisplay || `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`}
                          </div>
                        </div>
                      </div>
                    )}
                    {destination && typeof destination === 'object' && (
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1"></div>
                        <div className="min-w-0 flex-1">
                          <span className="text-muted-foreground text-xs">To:</span>
                          <div className="truncate font-medium">
                            {destinationDisplay || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet for Quick Actions */}
        {showPanels && (
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t shadow-lg">
            <div className="p-3 space-y-3">
              {/* Quick Route Setup */}
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={clickMode === 'origin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClickMode(clickMode === 'origin' ? 'none' : 'origin')}
                    className="text-xs h-8"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {clickMode === 'origin' ? 'Cancel' : 'Start'}
                  </Button>
                  <Button
                    type="button"
                    variant={clickMode === 'destination' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClickMode(clickMode === 'destination' ? 'none' : 'destination')}
                    className="text-xs h-8"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    {clickMode === 'destination' ? 'Cancel' : 'End'}
                  </Button>
                </div>
                
                {/* Calculate Route Button */}
                <Button
                  onClick={handleCalculateRoute}
                  disabled={!origin || !destination || !selectedVehicleId || calculateRoute.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-8 px-4"
                >
                  {calculateRoute.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Route className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {/* Status indicator */}
              {clickMode !== 'none' && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Tap map to set {clickMode === 'origin' ? 'starting point' : 'destination'}
                  </p>
                </div>
              )}

              {/* Current route summary */}
              {(origin || destination) && (
                <div className="text-xs text-center space-y-1">
                  {origin && typeof origin === 'object' && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="truncate max-w-[200px]">
                        {originDisplay || 'Start set'}
                      </span>
                    </div>
                  )}
                  {destination && typeof destination === 'object' && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="truncate max-w-[200px]">
                        {destinationDisplay || 'End set'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Station Details Sidebar - Mobile responsive */}
        {selectedStationId && (
          <div className="fixed top-12 sm:top-16 right-0 z-30 w-full sm:w-80 h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)] bg-white border-l shadow-xl">
            <StationDetailsSidebar
              stationId={selectedStationId}
              onClose={() => setSelectedStationId(null)}
            />
          </div>
        )}

        {/* Right Panel - Route Statistics and Navigation - Mobile responsive */}
        {currentRoute && !selectedStationId && showPanels && (
          <div className="hidden lg:block absolute top-32 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-9rem)] overflow-y-auto space-y-4">
            {/* Navigation Panel */}
            <NavigationPanel
              route={currentRoute?.route}
              isNavigating={navigation.isNavigating}
              onStartNavigation={() => navigation.startNavigation(currentRoute?.route)}
              onStopNavigation={navigation.stopNavigation}
              onPauseNavigation={navigation.pauseNavigation}
              onResumeNavigation={navigation.resumeNavigation}
              currentStepIndex={navigation.currentStepIndex}
              onStepChange={navigation.setCurrentStep}
            />

            <RouteStatisticsPanel
              distance={routeStats.distance}
              duration={routeStats.duration}
              energyConsumption={routeStats.energyConsumption}
              estimatedCost={routeStats.estimatedCost}
              chargingStops={currentRoute?.chargingStations?.length || 0}
            />

            {/* Enhanced Route Details */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Route Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Charging Time:</span>
                    <div className="font-medium">{routeStats.chargingTime}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Final Battery:</span>
                    <div className="font-medium">{routeStats.batteryLevel}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mobile Route Statistics Overlay */}
        {currentRoute && !selectedStationId && showPanels && (
          <div className="lg:hidden absolute top-16 left-2 right-2 z-10 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <Card className="shadow-lg bg-white/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Route className="h-4 w-4 text-blue-600" />
                    Route Summary
                  </h3>
                  <Button
                    onClick={() => setShowPanels(false)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-900">{routeStats.distance}</div>
                    <div className="text-blue-600">Distance</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-900">{routeStats.duration}</div>
                    <div className="text-green-600">Duration</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-semibold text-yellow-900">{routeStats.estimatedCost}</div>
                    <div className="text-yellow-600">Cost</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-semibold text-purple-900">{currentRoute?.chargingStations?.length || 0}</div>
                    <div className="text-purple-600">Stops</div>
                  </div>
                </div>

                {/* Navigation Controls for Mobile */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigation.startNavigation(currentRoute?.route)}
                      disabled={navigation.isNavigating}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs"
                    >
                      {navigation.isNavigating ? (
                        <>
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigating
                        </>
                      ) : (
                        <>
                          <Navigation className="h-3 w-3 mr-1" />
                          Start Navigation
                        </>
                      )}
                    </Button>
                    
                    {navigation.isNavigating && (
                      <Button
                        onClick={navigation.stopNavigation}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

export default function MapPage() {
  return (
    <NavigationProvider>
      <MapProvider>
        <MapPageContent />
      </MapProvider>
    </NavigationProvider>
  );
}