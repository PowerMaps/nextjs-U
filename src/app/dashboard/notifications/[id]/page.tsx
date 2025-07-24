"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NotificationDetail } from '@/components/notifications/notification-detail';

export default function NotificationDetailPage() {
  const { id } = useParams();

  // Placeholder for fetching notification data
  const notification = {
    id: id as string,
    type: 'info' as const,
    message: `Notification ${id} details`,
    timestamp: 'Just now',
    details: `This is the detailed content for notification ${id}. It can contain more extensive information about the event, such as specific actions taken, relevant data, or links to further resources.`, 
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Notification Details</h1>
      <NotificationDetail notification={notification} />
    </DashboardLayout>
  );
}