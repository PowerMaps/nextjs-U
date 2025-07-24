"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const trips = [
  {
    id: 1,
    destination: 'Tunis',
    date: '2023-03-15',
    distance: '150 km',
    duration: '2h 30m',
  },
  {
    id: 2,
    destination: 'Sousse',
    date: '2023-02-20',
    distance: '120 km',
    duration: '1h 45m',
  },
  {
    id: 3,
    destination: 'Hammamet',
    date: '2023-01-10',
    distance: '80 km',
    duration: '1h 00m',
  },
];

export function TripHistoryVisualization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {trips.map((trip) => (
            <li key={trip.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{trip.destination}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {trip.date} - {trip.distance} - {trip.duration}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}