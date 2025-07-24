"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Snowflake } from 'lucide-react';

interface DailyForecast {
  date: string;
  temperature: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy';
}

interface WeatherForecastProps {
  forecast: DailyForecast[];
}

const getWeatherIcon = (condition: DailyForecast['condition']) => {
  switch (condition) {
    case 'Sunny':
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case 'Cloudy':
      return <Cloud className="h-6 w-6 text-gray-500" />;
    case 'Rainy':
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    case 'Snowy':
      return <Snowflake className="h-6 w-6 text-blue-300" />;
    default:
      return <Cloud className="h-6 w-6 text-gray-500" />;
  }
};

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecast.map((day) => (
            <div key={day.date} className="flex flex-col items-center p-4 border rounded-lg">
              <p className="text-sm font-medium">{day.date}</p>
              <div className="my-2">{getWeatherIcon(day.condition)}</div>
              <p className="text-lg font-bold">{day.temperature}°C</p>
              <p className="text-sm text-muted-foreground">{day.condition}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}