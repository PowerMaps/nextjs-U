"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { WeatherForecast } from '@/components/weather/weather-forecast';
import { WeatherImpactIndicators } from '@/components/weather/weather-impact-indicators';
import { CurrentWeather } from '@/components/weather/current-weather';

export default function WeatherPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Weather Information</h1>
      <CurrentWeather location="Tunis" temperature={25} condition="Sunny" humidity={60} />
      <div className="mt-8">
        <WeatherForecast
          forecast={[
            { date: 'Today', temperature: 28, condition: 'Sunny' },
            { date: 'Tomorrow', temperature: 26, condition: 'Cloudy' },
            { date: 'Fri', temperature: 22, condition: 'Rainy' },
            { date: 'Sat', temperature: 24, condition: 'Sunny' },
            { date: 'Sun', temperature: 20, condition: 'Cloudy' },
          ]}
        />
      </div>
      <div className="mt-8">
        <WeatherImpactIndicators weatherCondition="Sunny" />
      </div>
    </DashboardLayout>
  );
}