"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Route, 
  Clock, 
  DollarSign, 
  Zap, 
  MapPin, 
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Share2
} from 'lucide-react';

interface RouteAlternative {
  id: string;
  name: string;
  analysis: {
    totalDistance: number;
    totalTime: number;
    estimatedCost: number;
    chargingTime: number;
    energyConsumption: number;
    batteryLevelAtDestination: number;
  };
  chargingStations: any[];
  metadata: {
    priorityMode: string;
    routeOptimized: boolean;
    needsCharging: boolean;
  };
  route: any;
}

interface RouteAlternativesProps {
  alternatives: RouteAlternative[];
  selectedRouteId?: string;
  onSelectRoute: (routeId: string) => void;
  onSaveRoute?: (routeId: string) => void;
  onShareRoute?: (routeId: string) => void;
}

export function RouteAlternatives({ 
  alternatives, 
  selectedRouteId, 
  onSelectRoute, 
  onSaveRoute,
  onShareRoute 
}: RouteAlternativesProps) {
  const [comparisonMode, setComparisonMode] = useState<'list' | 'comparison'>('list');

  if (!alternatives || alternatives.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No alternative routes available
        </CardContent>
      </Card>
    );
  }

  const getBestRoute = (metric: 'time' | 'cost' | 'distance' | 'efficiency') => {
    return alternatives.reduce((best, current) => {
      switch (metric) {
        case 'time':
          return current.analysis.totalTime < best.analysis.totalTime ? current : best;
        case 'cost':
          return current.analysis.estimatedCost < best.analysis.estimatedCost ? current : best;
        case 'distance':
          return current.analysis.totalDistance < best.analysis.totalDistance ? current : best;
        case 'efficiency':
          const currentEfficiency = current.analysis.energyConsumption / current.analysis.totalDistance;
          const bestEfficiency = best.analysis.energyConsumption / best.analysis.totalDistance;
          return currentEfficiency < bestEfficiency ? current : best;
        default:
          return best;
      }
    });
  };

  const getComparisonIcon = (current: number, best: number, metric: 'time' | 'cost' | 'distance') => {
    const tolerance = 0.05; // 5% tolerance
    const diff = Math.abs(current - best) / best;
    
    if (diff < tolerance) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    
    const isBetter = current < best;
    return isBetter ? 
      <TrendingDown className="h-4 w-4 text-green-600" /> : 
      <TrendingUp className="h-4 w-4 text-red-600" />;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const RouteCard = ({ route, isSelected }: { route: RouteAlternative; isSelected: boolean }) => (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="h-5 w-5" />
            {route.name}
          </CardTitle>
          <div className="flex gap-1">
            {route.id === getBestRoute('time').id && (
              <Badge variant="secondary" className="text-xs">Fastest</Badge>
            )}
            {route.id === getBestRoute('cost').id && (
              <Badge variant="secondary" className="text-xs">Cheapest</Badge>
            )}
            {route.id === getBestRoute('distance').id && (
              <Badge variant="secondary" className="text-xs">Shortest</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm text-muted-foreground">Distance</div>
              <div className="font-semibold">{route.analysis.totalDistance} km</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-sm text-muted-foreground">Total Time</div>
              <div className="font-semibold">{formatTime(route.analysis.totalTime)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="text-sm text-muted-foreground">Cost</div>
              <div className="font-semibold">${route.analysis.estimatedCost.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-sm text-muted-foreground">Charging</div>
              <div className="font-semibold">{formatTime(route.analysis.chargingTime)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {route.chargingStations.length} charging stops
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSaveRoute?.(route.id);
              }}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShareRoute?.(route.id);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onSelectRoute(route.id)}
              disabled={isSelected}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ComparisonTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Route</th>
            <th className="text-center p-3">Distance</th>
            <th className="text-center p-3">Time</th>
            <th className="text-center p-3">Cost</th>
            <th className="text-center p-3">Charging</th>
            <th className="text-center p-3">Stops</th>
            <th className="text-center p-3">Efficiency</th>
            <th className="text-center p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {alternatives.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const efficiency = route.analysis.energyConsumption / route.analysis.totalDistance;
            
            return (
              <tr 
                key={route.id} 
                className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    <span className="font-medium">{route.name}</span>
                    {isSelected && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className="flex items-center justify-center gap-1">
                    {getComparisonIcon(route.analysis.totalDistance, getBestRoute('distance').analysis.totalDistance, 'distance')}
                    {route.analysis.totalDistance} km
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className="flex items-center justify-center gap-1">
                    {getComparisonIcon(route.analysis.totalTime, getBestRoute('time').analysis.totalTime, 'time')}
                    {formatTime(route.analysis.totalTime)}
                  </div>
                </td>
                <td className="text-center p-3">
                  <div className="flex items-center justify-center gap-1">
                    {getComparisonIcon(route.analysis.estimatedCost, getBestRoute('cost').analysis.estimatedCost, 'cost')}
                    ${route.analysis.estimatedCost.toFixed(2)}
                  </div>
                </td>
                <td className="text-center p-3">
                  {formatTime(route.analysis.chargingTime)}
                </td>
                <td className="text-center p-3">
                  {route.chargingStations.length}
                </td>
                <td className="text-center p-3">
                  {efficiency.toFixed(2)} kWh/100km
                </td>
                <td className="text-center p-3">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onSelectRoute(route.id)}
                    disabled={isSelected}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Alternatives ({alternatives.length})
          </CardTitle>
          <Tabs value={comparisonMode} onValueChange={(value) => setComparisonMode(value as 'list' | 'comparison')}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={comparisonMode}>
          <TabsContent value="list" className="space-y-4">
            {alternatives.map((route) => (
              <div key={route.id} onClick={() => onSelectRoute(route.id)}>
                <RouteCard 
                  route={route} 
                  isSelected={route.id === selectedRouteId}
                />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="comparison">
            <ComparisonTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}