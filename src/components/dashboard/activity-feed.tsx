"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activities = [
  {
    id: 1,
    type: 'trip',
    description: 'New trip planned to Tunis',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    type: 'charge',
    description: 'Charging session completed at Sousse station',
    timestamp: '1 day ago',
  },
  {
    id: 3,
    type: 'message',
    description: 'New message from support',
    timestamp: '2 days ago',
  },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center">
              <div className="flex-shrink-0">
                {activity.type === 'trip' && (
                  <svg
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l6 3-6 3-6-3v8.764l6 3 6-3-1.447-.724"
                    />
                  </svg>
                )}
                {activity.type === 'charge' && (
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                )}
                {activity.type === 'message' && (
                  <svg
                    className="h-6 w-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.timestamp}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}