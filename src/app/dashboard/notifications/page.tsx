"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NotificationCenter } from '@/components/notifications/notification-center';

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationCenter />
    </DashboardLayout>
  );
}