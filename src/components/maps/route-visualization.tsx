"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Navigation,
  Clock,
  Zap,
  DollarSign,
  MapPin,
  Battery,
  Thermometer,
  AlertTriangle
} from 'lucide-react';

interface RouteVisualizationProps {
  map: google.maps.Map | null;
  route: any; // Route data from API
  onStationClick?: (stationId: string) => void;
}

interface ChargingStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  chargingTime: number;
  cost: number;
  batteryLevelAfter: number;
  connectorType: string;
  status: 'available' | 'occupied' | 'offline';
}

export function RouteVisualization({ map, route, onStationClick }: RouteVisualizationProps) {
  console.log('routtttt', route)
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    console.log('RouteVisualization received route:', route);
    console.log('Route type:', typeof route);
    if (route) {
      console.log('Route keys:', Object.keys(route));
    }

    if (!map || !route) return;

    // Clear existing route and markers
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Draw route using polyline from your API data
    try {
      let routeData;
      let polylineString;

      // Check if it's your API format with nested route.routes
      if (route && route.route && route.route.routes && Array.isArray(route.route.routes)) {
        routeData = route.route.routes[0]; // Use first route
        polylineString = routeData.overview_polyline?.points;
        console.log('Using API format, found polyline:', polylineString);
      }
      // Check if it's direct Google Maps format
      else if (route && route.routes && Array.isArray(route.routes)) {
        routeData = route.routes[0]; // Use first route
        polylineString = routeData.overview_polyline?.points;
        console.log('Using direct format, found polyline:', polylineString);
      }
      else {
        console.log('No valid route data found in:', route);
        return;
      }

      if (!polylineString) {
        console.log('No polyline string found in route data');
        return;
      }

      // Decode the polyline string to get coordinates
      const decodedPath = google.maps.geometry.encoding.decodePath(polylineString);
      console.log('Decoded path with', decodedPath.length, 'points');

      // Create and display the polyline
      const routePolyline = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      });

      routePolyline.setMap(map);
      polylineRef.current = routePolyline;

      // Add start and end markers
      if (route.origin && route.destination) {
        // Start marker
        const startMarker = new google.maps.Marker({
          position: route.origin,
          map: map,
          title: 'Start',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8,
          },
          label: {
            text: 'A',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });

        // End marker
        const endMarker = new google.maps.Marker({
          position: route.destination,
          map: map,
          title: 'Destination',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#F44336',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8,
          },
          label: {
            text: 'B',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });

        markersRef.current.push(startMarker, endMarker);
      }

      // Fit map to route bounds
      if (routeData.bounds) {
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(routeData.bounds.southwest.lat, routeData.bounds.southwest.lng),
          new google.maps.LatLng(routeData.bounds.northeast.lat, routeData.bounds.northeast.lng)
        );
        map.fitBounds(bounds);
        console.log('Map bounds fitted to route');
      }

      console.log('Route polyline rendered successfully');

    } catch (error: any) {
      console.error('Error rendering route polyline:', error);
      console.error('Error details:', error.message);
      console.error('Route data that caused error:', route);
    }

    // Add charging station markers - handle different data formats
    const chargingStations = route.chargingStations || route.charging_stations || [];
    if (chargingStations && chargingStations.length > 0) {
      chargingStations.forEach((station: any, index: number) => {
        const marker = new google.maps.Marker({
          position: { lat: station.latitude, lng: station.longitude },
          map: map,
          title: station.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getStationColor(station.status || (station.isActive ? 'available' : 'offline')),
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 10,
          },
          label: {
            text: (index + 1).toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          infoWindowRef.current = new google.maps.InfoWindow({
            content: createStationInfoContent(station, index + 1)
          });

          infoWindowRef.current.open(map, marker);
          onStationClick?.(station.id);
        });

        markersRef.current.push(marker);
      });
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [map, route, onStationClick]);

  const getStationColor = (status: ChargingStop['status']) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'occupied':
        return '#FFC107';
      case 'offline':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const createStationInfoContent = (station: any, stopNumber: number) => {
    return `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
          Stop ${stopNumber}: ${station.name}
        </h3>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px;">
          <div>⚡ Charging Time: ${station.chargingTime} min</div>
          <div>💰 Cost: €${station.cost ? station.cost.toFixed(2) : '0.00'}</div>
          <div>🔋 Battery After: ${station.batteryLevelAfter}%</div>
          <div>🔌 Connector: ${station.connectorType}</div>
          <div>Status: <span style="color: ${getStationColor(station.status)}; font-weight: bold;">${station.status}</span></div>
        </div>
      </div>
    `;
  };

  if (!route) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Calculate a route to see visualization
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Route Statistics Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Distance</div>
                <div className="font-semibold">{route.analysis?.totalDistance || 0} km</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Time</div>
                <div className="font-semibold">{Math.round((route.analysis?.totalTime || 0) / 60)} min</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-sm text-muted-foreground">Est. Cost</div>
                <div className="font-semibold">${(route.analysis?.estimatedCost || 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">Charging Time</div>
                <div className="font-semibold">{Math.round((route.analysis?.chargingTime || 0) / 60)} min</div>
              </div>
            </div>
          </div>

          {route.analysis?.batteryLevelAtDestination && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Battery at destination: {route.analysis.batteryLevelAtDestination}%
                </span>
              </div>
            </div>
          )}

          {route.metadata?.weather && (
            <div className="mt-2 p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-600" />
                <span className="text-sm">
                  Weather considered in calculations
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charging Stops List */}
      {route.chargingStations && route.chargingStations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Charging Stops ({route.chargingStations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {route.chargingStations.map((station: ChargingStop, index: number) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onStationClick?.(station.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{station.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {/* {station.connectorType} • {station.chargingTime} min • ${station.cost.toFixed(2)} */}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={station.status === 'available' ? 'default' :
                        station.status === 'occupied' ? 'secondary' : 'destructive'}
                    >
                      {station.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {station.batteryLevelAfter}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings and Alerts */}
      {route.metadata?.needsCharging && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                This route requires charging stops to reach your destination
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}