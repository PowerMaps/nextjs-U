"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Battery, 
  Zap, 
  Clock, 
  DollarSign, 
  Gauge,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface RouteStatisticsProps {
  route: any;
}

export function RouteStatistics({ route }: RouteStatisticsProps) {
  if (!route || !route.analysis) {
    return null;
  }

  const { analysis, chargingStations, metadata } = route;

  // Prepare data for charts
  const chargingData = chargingStations?.map((station: any, index: number) => ({
    name: `Stop ${index + 1}`,
    chargingTime: station.chargingTime,
    cost: station.cost,
    batteryGain: station.batteryLevelAfter - (index === 0 ? (analysis.initialBatteryPercentage || 80) : chargingStations[index - 1].batteryLevelAfter)
  })) || [];

  const costBreakdown = analysis.costBreakdown?.map((item: any) => ({
    name: item.stationName,
    value: item.cost
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const batteryProgress = analysis.batteryLevelAtDestination || 0;
  const energyEfficiency = analysis.energyConsumption / analysis.totalDistance;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">{analysis.totalDistance} km</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{Math.round(analysis.totalTime / 60)}m</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${analysis.estimatedCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Used</p>
                <p className="text-2xl font-bold">{analysis.energyConsumption.toFixed(1)} kWh</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battery and Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Battery Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Battery at Destination</span>
                <span>{batteryProgress}%</span>
              </div>
              <Progress value={batteryProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Starting Battery</p>
                <p className="font-semibold">{analysis.initialBatteryPercentage || 80}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Battery Capacity</p>
                <p className="font-semibold">{analysis.batteryCapacity || 75} kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{energyEfficiency.toFixed(2)} kWh/1km</p>
              <p className="text-sm text-muted-foreground">Energy consumption rate</p>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Efficient route selected</span>
            </div>
            
            {metadata?.weatherConsidered && (
              <Badge variant="outline">Weather optimized</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charging Analysis Charts */}
      {chargingData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Charging Time by Stop</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chargingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} min`, 'Charging Time']} />
                  <Bar dataKey="chargingTime" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Route Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Route Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Calculated At</p>
              <p>{new Date(metadata?.calculatedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vehicle Used</p>
              <p>{metadata?.vehicleUsed || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Route Optimized</p>
              <p>{metadata?.routeOptimized ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Needs Charging</p>
              <p>{metadata?.needsCharging ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}