"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { RoutePlanner } from '@/components/maps/route-planner';
import { RouteAlternatives } from '@/components/maps/route-alternatives';

export default function RoutePlanningPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Route Planning</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoutePlanner />
        <RouteAlternatives
          alternatives={[
            {
              id: '1',
              name: 'Fastest Route',
              analysis: {
                totalDistance: 150,
                totalTime: 150, // 2h 30m in minutes
                estimatedCost: 12.50,
                chargingTime: 45,
                energyConsumption: 25,
                batteryLevelAtDestination: 65
              },
              chargingStations: [
                { id: 'station1', name: 'Fast Charge Station' },
                { id: 'station2', name: 'Highway Charging Hub' }
              ],
              metadata: {
                priorityMode: 'fastest',
                routeOptimized: true,
                needsCharging: true
              },
              route: {}
            },
            {
              id: '2',
              name: 'Shortest Route',
              analysis: {
                totalDistance: 130,
                totalTime: 165, // 2h 45m in minutes
                estimatedCost: 10.80,
                chargingTime: 30,
                energyConsumption: 22,
                batteryLevelAtDestination: 70
              },
              chargingStations: [
                { id: 'station3', name: 'City Charging Point' }
              ],
              metadata: {
                priorityMode: 'shortest',
                routeOptimized: true,
                needsCharging: true
              },
              route: {}
            },
            {
              id: '3',
              name: 'Eco Route',
              analysis: {
                totalDistance: 160,
                totalTime: 180, // 3h 00m in minutes
                estimatedCost: 9.50,
                chargingTime: 60,
                energyConsumption: 20,
                batteryLevelAtDestination: 75
              },
              chargingStations: [
                { id: 'station4', name: 'Eco Charging Station' },
                { id: 'station5', name: 'Solar Powered Charger' }
              ],
              metadata: {
                priorityMode: 'balanced',
                routeOptimized: true,
                needsCharging: true
              },
              route: {}
            }
          ]}
          onSelectRoute={(routeId) => console.log("Selected route:", routeId)}
        />
      </div>
    </DashboardLayout>
  );
}