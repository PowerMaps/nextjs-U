"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ChargingSessionAnalytics } from '@/components/dashboard/charging-session-analytics';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TripHistoryVisualization } from '@/components/dashboard/trip-history-visualization';
import { UsageStatisticsChart } from '@/components/dashboard/usage-statistics-chart';






export default function DashboardPage() {
  const { user } = useCurrentUser();

  return (
    <DashboardLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="col-span-1 lg:col-span-2">
          <h1 className="text-3xl font-bold">Welcome, {user?.email}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Here is a summary of your activity.</p>
          <div className="mt-8">
            <QuickActions />
          </div>
        </div>

        <div className="col-span-1 lg:col-span-1">
          <ActivityFeed />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <UsageStatisticsChart />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <TripHistoryVisualization />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ChargingSessionAnalytics />
        </div>
      </div>

    </DashboardLayout>
  );
}