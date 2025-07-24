"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteStatisticsPanelProps {
  distance: string;
  duration: string;
  energyConsumption: string;
}

export function RouteStatisticsPanel({ distance, duration, energyConsumption }: RouteStatisticsPanelPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Distance</p>
          <p className="text-lg font-semibold">{distance}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Estimated Time</p>
          <p className="text-lg font-semibold">{duration}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Energy Consumption</p>
          <p className="text-lg font-semibold">{energyConsumption}</p>
        </div>
      </CardContent>
    </Card>
  );
}