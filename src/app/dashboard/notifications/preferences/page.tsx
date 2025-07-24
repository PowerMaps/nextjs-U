"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NotificationPreferences } from '@/components/notifications/notification-preferences';

export default function NotificationPreferencesPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
      <NotificationPreferences />
    </DashboardLayout>
  );
}