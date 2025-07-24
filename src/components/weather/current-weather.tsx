"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Droplet, Thermometer } from 'lucide-react';

interface CurrentWeatherProps {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}

export function CurrentWeather({ location, temperature, condition, humidity }: CurrentWeatherProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Weather in {location}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-6 w-6 text-red-500" />
            <p className="text-4xl font-bold">{temperature}°C</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">{condition}</p>
            <p className="text-sm text-muted-foreground">Feels like {temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplet className="h-5 w-5 text-blue-500" />
            <p className="text-sm">Humidity: {humidity}%</p>
          </div>
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-gray-500" />
            <p className="text-sm">Cloudy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}