"use client";

import React, { useState, useEffect } from 'react';

import { AddressAutocomplete } from '@/components/maps/address-autocomplete';
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
import { Loader2, Route, Zap, X, ArrowLeft, Menu } from 'lucide-react';
import { MapProvider } from '@/lib/contexts/map-context';
import { NavigationProvider, useNavigation } from '@/lib/contexts/navigation-context';
import { NavigationPanel } from '@/components/maps/navigation-panel';
import { NavigationInstructionOverlay } from '@/components/maps/navigation-instruction-overlay';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

function MapPageContent() {
  // State for route planning
  const [origin, setOrigin] = useState<string | Coordinates>('');
  const [destination, setDestination] = useState<string | Coordinates>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [currentRoute, setCurrentRoute] = useState<EVRouteResponse | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 32.7128, lng: 10.0060 }); // Default to NYC
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
            name: 'Starting Point',
            latitude: originCoords.lat,
            longitude: originCoords.lng,
            type: 'origin' as const
          },
          {
            id: 'destination',
            name: 'Destination',
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
      console.log('Route data structure:', result.route);
      console.log('Route type:', typeof result.route);
      console.log('Charging stations:', result.chargingStations);
      if (result.route) {
        console.log('Route keys:', Object.keys(result.route));
      }
      if (result.chargingStations) {
        console.log('Charging stations count:', result.chargingStations.length);
      }
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

  // Handle address selection
  const handleOriginSelect = (address: { name: string; longitude: number; latitude: number }) => {
    const coordinates: Coordinates = { lat: address.latitude, lng: address.longitude };
    setOrigin(coordinates);
    setMapCenter(coordinates);

    // Add or update origin marker
    setPoiMarkers(prev => {
      const filtered = prev.filter(marker => marker.type !== 'origin');
      return [...filtered, {
        id: 'origin',
        name: address.name,
        latitude: address.latitude,
        longitude: address.longitude,
        type: 'origin' as const
      }];
    });
  };

  const handleDestinationSelect = (address: { name: string; longitude: number; latitude: number }) => {
    const coordinates: Coordinates = { lat: address.latitude, lng: address.longitude };
    setDestination(coordinates);

    // Add or update destination marker
    setPoiMarkers(prev => {
      const filtered = prev.filter(marker => marker.type !== 'destination');
      return [...filtered, {
        id: 'destination',
        name: address.name,
        latitude: address.latitude,
        longitude: address.longitude,
        type: 'destination' as const
      }];
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

        // Show success toast
        toast({
          title: "Origin set",
          description: `Starting point set to: ${address}`,
        });

      } else if (clickMode === 'destination') {
        const coords: Coordinates = { lat: coordinates.lat, lng: coordinates.lng };
        setDestination(coords);

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

        // Show success toast
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
    console.log(analysis);

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
      {/* Full-screen map container */}
      <div className={`relative h-screen overflow-hidden bg-gray-100 transition-all duration-300 ${selectedStationId ? 'w-[calc(100vw-320px)]' : 'w-screen'
        }`}>
        {/* Main Map */}
        <Map
          key={selectedStationId ? 'with-sidebar' : 'without-sidebar'}
          initialLat={mapCenter.lat}
          initialLng={mapCenter.lng}
          routeData={currentRoute}
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

        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium hidden sm:inline">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:inline">Route Planner</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowPanels(!showPanels)}
                variant="outline"
                size="sm"
                title={showPanels ? "Hide panels" : "Show panels"}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>



        {/* Left Control Panel */}
        {showPanels && (
          <div className="absolute top-20 left-4 z-10 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4">
            {/* Route Planning Section */}
            <Card className="shadow-lg bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
                  <Route className="h-4 w-4 text-blue-600" />
                  Route Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Origin Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-blue-700">Starting Point</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full z-10"></div>
                    <div className="pl-8">
                      <AddressAutocomplete
                        onSelectAddress={handleOriginSelect}
                        placeholder="Choose starting point"
                      />
                    </div>
                  </div>
                </div>

                {/* Destination Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-blue-700">Destination</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full z-10"></div>
                    <div className="pl-8">
                      <AddressAutocomplete
                        onSelectAddress={handleDestinationSelect}
                        placeholder="Choose destination"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleCalculateRoute}
                    disabled={!origin || !destination || !selectedVehicleId || calculateRoute.isPending}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {calculateRoute.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Calculate Route'
                    )}
                  </Button>

                  {poiMarkers.length > 0 && (
                    <Button
                      onClick={clearMarkers}
                      variant="outline"
                      size="sm"
                      title="Clear all"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Test Route Button */}
                  <Button
                    onClick={() => {
                      console.log('Setting test route');
                      const testRoute = {
                        success: true,
                        route: {
                          coordinates: [
                            [10.0, 36.8], // Tunis area coordinates
                            [10.1, 36.85],
                            [10.2, 36.9],
                            [10.3, 36.95]
                          ]
                        },
                        chargingStations: [
                          {
                            id: 'test-station-1',
                            name: 'Test Station 1',
                            latitude: 36.85,
                            longitude: 10.1,
                            isActive: true,
                            chargingTime: 30,
                            cost: 15.50,
                            batteryLevelAfter: 80,
                            connectorType: 'Type 2'
                          }
                        ],
                        analysis: {
                          totalDistance: 50,
                          totalTime: 3600,
                          estimatedCost: 15.50,
                          energyConsumption: 12,
                          chargingTime: 1800,
                          batteryLevelAtDestination: 80
                        }
                      };
                      setCurrentRoute(testRoute);
                      setRouteDetails(testRoute);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Test Route
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            <Card className="shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-medium">Vehicle</label>
                  <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
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
                            {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Click Mode Controls */}
            <Card className="shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-medium">Quick Set</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={clickMode === 'origin' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClickMode(clickMode === 'origin' ? 'none' : 'origin')}
                      className="text-xs h-8"
                    >
                      {clickMode === 'origin' ? 'Cancel' : 'Set Origin'}
                    </Button>
                    <Button
                      type="button"
                      variant={clickMode === 'destination' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setClickMode(clickMode === 'destination' ? 'none' : 'destination')}
                      className="text-xs h-8"
                    >
                      {clickMode === 'destination' ? 'Cancel' : 'Set Dest'}
                    </Button>
                  </div>
                  {clickMode !== 'none' && (
                    <p className="text-xs text-muted-foreground">
                      Click map to set {clickMode}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Route Info */}
            {(origin || destination) && (
              <Card className="shadow-lg">
                <CardContent className="p-2 sm:p-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Current Route</label>
                    {origin && typeof origin === 'object' && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className="text-muted-foreground">From:</span>
                        <span className="truncate">{poiMarkers.find(m => m.type === 'origin')?.name || `${origin.lat}, ${origin.lng}`}</span>
                      </div>
                    )}
                    {destination && typeof destination === 'object' && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <span className="text-muted-foreground">To:</span>
                        <span className="truncate">{poiMarkers.find(m => m.type === 'destination')?.name || `${destination.lat}, ${destination.lng}`}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet for Controls */}
        {showPanels && (
          <div className="lg:hidden absolute bottom-0 left-0 right-0 z-20 bg-white border-t shadow-lg max-h-[40vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Vehicle Selection - Mobile */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle</label>
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger className="h-9">
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
                          {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Set Controls - Mobile */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Set</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={clickMode === 'origin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClickMode(clickMode === 'origin' ? 'none' : 'origin')}
                    className="text-xs"
                  >
                    {clickMode === 'origin' ? 'Cancel' : 'Set Origin'}
                  </Button>
                  <Button
                    type="button"
                    variant={clickMode === 'destination' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setClickMode(clickMode === 'destination' ? 'none' : 'destination')}
                    className="text-xs"
                  >
                    {clickMode === 'destination' ? 'Cancel' : 'Set Dest'}
                  </Button>
                </div>
                {clickMode !== 'none' && (
                  <p className="text-xs text-muted-foreground">
                    Click map to set {clickMode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Station Details Sidebar */}
        {selectedStationId && (
          <div className="fixed top-16 right-0 z-30 w-80 h-[calc(100vh-4rem)] bg-white border-l shadow-xl">
            <StationDetailsSidebar
              stationId={selectedStationId}
              onClose={() => setSelectedStationId(null)}
            />
          </div>
        )}

        {/* Right Panel - Route Statistics and Navigation */}
        {currentRoute && !selectedStationId && showPanels && (
          <div className="absolute top-32 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-9rem)] overflow-y-auto space-y-4">
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
                  {routeDetails?.analysis?.initialBatteryPercentage && (
                    <div>
                      <span className="text-muted-foreground">Start Battery:</span>
                      <div className="font-medium">{routeDetails.analysis.initialBatteryPercentage}%</div>
                    </div>
                  )}
                  {routeDetails?.analysis?.batteryCapacity && (
                    <div>
                      <span className="text-muted-foreground">Battery Capacity:</span>
                      <div className="font-medium">{routeDetails?.analysis?.batteryCapacity} kWh</div>
                    </div>
                  )}
                </div>

                {routeDetails?.metadata?.vehicleEfficiency && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Efficiency:</span>
                    <span className="font-medium ml-1">{routeDetails?.metadata?.vehicleEfficiency} kWh/km</span>
                  </div>
                )}

                {routeDetails?.metadata?.weather && (
                  <div className="border-t pt-2">
                    <div className="text-xs font-medium mb-1">Weather Impact</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conditions:</span>
                        <span>{routeDetails.metadata.weather.conditions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{routeDetails.metadata.weather.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range Impact:</span>
                        <span className={routeDetails.metadata.weather.rangeImpact > 0 ? 'text-red-600' : 'text-green-600'}>
                          {routeDetails.metadata.weather.rangeImpact > 0 ? '-' : '+'}{Math.abs(routeDetails.metadata.weather.rangeImpact)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {routeDetails.analysis.costBreakdown && routeDetails.analysis.costBreakdown.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Charging Costs</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {routeDetails.analysis.costBreakdown.map((station: any, index: any) => (
                      <div key={`${station.stationId}-${index}`} className="border rounded p-2">
                        <div className="font-medium text-xs">{station.stationName}</div>
                        <div className="text-xs text-muted-foreground">{station.connectorType} • {station.connectorPower}kW</div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs">{station.energyCharged} kWh</span>
                          <span className="text-xs font-medium">€{station.cost}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(station.chargingTime / 60)} min • €{station.pricePerKwh}/kWh
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Mobile Route Statistics - Bottom Sheet */}
        {currentRoute && !selectedStationId && (
          <div className="xl:hidden absolute bottom-0 left-0 right-0 z-20 bg-white border-t shadow-lg max-h-[40vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Route Statistics</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentRoute(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Compact Route Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{routeStats.distance}</div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{routeStats.duration}</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{routeStats.energyConsumption}</div>
                  <div className="text-xs text-muted-foreground">Energy</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{routeStats.estimatedCost}</div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                </div>
              </div>

              {/* Additional Details - Collapsible */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Charging Time:</span>
                  <div className="font-medium">{routeStats.chargingTime}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Final Battery:</span>
                  <div className="font-medium">{routeStats.batteryLevel}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Charging Stops:</span>
                  <div className="font-medium">{currentRoute?.chargingStations?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Panel - Charging Stations */}
        {/* {((currentRoute?.chargingStations && currentRoute.chargingStations.length > 0) ||
            (nearbyStations && nearbyStations.length > 0)) && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <Card className="shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4" />
                      {currentRoute?.chargingStations && currentRoute.chargingStations.length > 0
                        ? `Route Charging Stops (${currentRoute.chargingStations.length})`
                        : `Nearby Stations (${nearbyStations?.length || 0})`
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {(() => {
                        const stationsToShow = currentRoute?.chargingStations && currentRoute.chargingStations.length > 0
                          ? currentRoute.chargingStations
                          : nearbyStations || [];

                        return stationsToShow.slice(0, 5).map((station) => (
                          <div key={station.id} className="flex-shrink-0 p-3 border rounded-lg bg-white min-w-[200px]">
                            <div className="font-medium text-sm">{station.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {station.address || (station.latitude && station.longitude
                                ? `${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}`
                                : 'Location unavailable')}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${station.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {station.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {station.connectors?.length || 0} ports
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {station.type || 'public'}
                              </span>
                            </div>
                            {station.rate && (
                              <div className="text-xs text-muted-foreground mt-1">
                                ⭐ {station.rate.toFixed(1)}
                              </div>
                            )}
                            {station.openingTime && station.closingTime && (
                              <div className="text-xs text-muted-foreground mt-1">
                                🕒 {station.openingTime} - {station.closingTime}
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )} */}

        {/* Mobile Navigation and Route Statistics - Bottom Sheet */}
        {currentRoute && showPanels && (
          <div className="lg:hidden absolute bottom-0 left-0 right-0 z-20 bg-white border-t shadow-lg max-h-[50vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Navigation Panel - Mobile */}
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
            </div>
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