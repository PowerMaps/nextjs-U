"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

interface NotificationDetailProps {
  notification: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
    details: string;
  };
}

const getIcon = (type: NotificationDetailProps['notification']['type']) => {
  switch (type) {
    case 'info':
      return <Bell className="h-8 w-8 text-blue-500" />;
    case 'success':
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    case 'warning':
      return <XCircle className="h-8 w-8 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-8 w-8 text-red-500" />;
    default:
      return <Bell className="h-8 w-8 text-gray-500" />;
  }
};

export function NotificationDetail({ notification }: NotificationDetailProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4">
        {getIcon(notification.type)}
        <div>
          <CardTitle className="text-2xl">{notification.message}</CardTitle>
          <p className="text-sm text-muted-foreground">{notification.timestamp}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base">{notification.details}</p>
      </CardContent>
    </Card>
  );
}