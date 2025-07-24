"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, BatteryCharging, CloudOff } from 'lucide-react';

interface WeatherImpactIndicatorsProps {
  weatherCondition: 'Sunny' | 'Rainy' | 'Snowy' | 'Windy';
}

export function WeatherImpactIndicators({ weatherCondition }: WeatherImpactIndicatorsProps) {
  const getDrivingImpact = () => {
    switch (weatherCondition) {
      case 'Rainy':
        return "Roads may be slippery. Drive with caution.";
      case 'Snowy':
        return "Roads are likely to be hazardous. Consider avoiding non-essential travel.";
      case 'Windy':
        return "Strong crosswinds may affect vehicle stability.";
      default:
        return "Driving conditions are generally good.";
    }
  };

  const getChargingImpact = () => {
    switch (weatherCondition) {
      case 'Snowy':
        return "Charging efficiency might be slightly reduced in extreme cold.";
      case 'Rainy':
        return "Ensure charging port is dry before connecting.";
      default:
        return "No significant impact on charging expected.";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <Car className="h-6 w-6 text-blue-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Driving Conditions:</p>
            <p className="text-sm text-muted-foreground">{getDrivingImpact()}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <BatteryCharging className="h-6 w-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Charging Considerations:</p>
            <p className="text-sm text-muted-foreground">{getChargingImpact()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}