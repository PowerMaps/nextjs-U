"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddressAutocomplete } from './address-autocomplete';
import { useToast } from '@/components/ui/use-toast';
import { useCalculateRoute } from '@/lib/api/hooks/routing-hooks';
import { MapPin, Navigation, Settings, Car, Zap, Clock, DollarSign } from 'lucide-react';

interface Location {
  name: string;
  longitude: number;
  latitude: number;
}

interface RoutePreferences {
  priorityMode: 'balanced' | 'fastest' | 'cheapest' | 'shortest';
  considerWeather: boolean;
  considerTraffic: boolean;
  optimizeForCost: boolean;
  optimizeForTime: boolean;
  includeAlternatives: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  maxChargingStops: number;
  preferredChargingNetworks: string[];
}

interface RoutePlannerProps {
  onRouteCalculated?: (route: any) => void;
  selectedVehicleId?: string;
}

export function RoutePlanner({ onRouteCalculated, selectedVehicleId }: RoutePlannerProps) {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [vehicleId, setVehicleId] = useState<string>(selectedVehicleId || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences>({
    priorityMode: 'balanced',
    considerWeather: true,
    considerTraffic: true,
    optimizeForCost: false,
    optimizeForTime: false,
    includeAlternatives: true,
    avoidTolls: false,
    avoidHighways: false,
    maxChargingStops: 5,
    preferredChargingNetworks: []
  });

  const { toast } = useToast();
  const calculateRoute = useCalculateRoute();

  const handleCalculateRoute = async () => {
    if (!origin || !destination) {
      toast({
        title: "Missing Information",
        description: "Please select both an origin and a destination.",
        variant: "destructive",
      });
      return;
    }

    if (!vehicleId) {
      toast({
        title: "Vehicle Required",
        description: "Please select a vehicle for route calculation.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    try {
      const routeRequest = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        vehicleId,
        routeConfig: routePreferences
      };

      const result = await calculateRoute.mutateAsync(routeRequest);

      if (result.success) {
        toast({
          title: "Route Calculated",
          description: `Found route from ${origin.name} to ${destination.name}`,
        });
        onRouteCalculated?.(result);
      } else {
        toast({
          title: "Route Calculation Failed",
          description: "Unable to calculate route. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      toast({
        title: "Error",
        description: "An error occurred while calculating the route.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const updateRoutePreference = <K extends keyof RoutePreferences>(
    key: K,
    value: RoutePreferences[K]
  ) => {
    setRoutePreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Plan Your Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Origin
                </Label>
                <AddressAutocomplete
                  onSelectAddress={setOrigin}
                  placeholder="Enter starting location"
                />
                {origin && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {origin.name}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapLocations}
                  disabled={!origin || !destination}
                  className="rounded-full"
                >
                  ⇅
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Destination
                </Label>
                <AddressAutocomplete
                  onSelectAddress={setDestination}
                  placeholder="Enter destination"
                />
                {destination && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {destination.name}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Route Priority</Label>
                <Select
                  value={routePreferences.priorityMode}
                  onValueChange={(value: RoutePreferences['priorityMode']) =>
                    updateRoutePreference('priorityMode', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Balanced
                      </div>
                    </SelectItem>
                    <SelectItem value="fastest">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Fastest
                      </div>
                    </SelectItem>
                    <SelectItem value="cheapest">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cheapest
                      </div>
                    </SelectItem>
                    <SelectItem value="shortest">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Shortest Distance
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="considerWeather"
                    checked={routePreferences.considerWeather}
                    onCheckedChange={(checked) =>
                      updateRoutePreference('considerWeather', !!checked)
                    }
                  />
                  <Label htmlFor="considerWeather" className="text-sm">Consider Weather</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="considerTraffic"
                    checked={routePreferences.considerTraffic}
                    onCheckedChange={(checked) =>
                      updateRoutePreference('considerTraffic', !!checked)
                    }
                  />
                  <Label htmlFor="considerTraffic" className="text-sm">Consider Traffic</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="avoidTolls"
                    checked={routePreferences.avoidTolls}
                    onCheckedChange={(checked) =>
                      updateRoutePreference('avoidTolls', !!checked)
                    }
                  />
                  <Label htmlFor="avoidTolls" className="text-sm">Avoid Tolls</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="avoidHighways"
                    checked={routePreferences.avoidHighways}
                    onCheckedChange={(checked) =>
                      updateRoutePreference('avoidHighways', !!checked)
                    }
                  />
                  <Label htmlFor="avoidHighways" className="text-sm">Avoid Highways</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAlternatives"
                    checked={routePreferences.includeAlternatives}
                    onCheckedChange={(checked) =>
                      updateRoutePreference('includeAlternatives', !!checked)
                    }
                  />
                  <Label htmlFor="includeAlternatives" className="text-sm">Show Alternatives</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicle" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Select Vehicle
                </Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle1">Tesla Model 3 (2023)</SelectItem>
                    <SelectItem value="vehicle2">Nissan Leaf (2022)</SelectItem>
                    <SelectItem value="vehicle3">BMW i4 (2023)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Charging Stops</Label>
                <Select
                  value={routePreferences.maxChargingStops.toString()}
                  onValueChange={(value) =>
                    updateRoutePreference('maxChargingStops', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 stop</SelectItem>
                    <SelectItem value="2">2 stops</SelectItem>
                    <SelectItem value="3">3 stops</SelectItem>
                    <SelectItem value="5">5 stops</SelectItem>
                    <SelectItem value="10">Up to 10 stops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleCalculateRoute}
            className="flex-1"
            disabled={!origin || !destination || !vehicleId || isCalculating}
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Calculate Route
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}