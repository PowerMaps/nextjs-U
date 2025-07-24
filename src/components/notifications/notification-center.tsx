"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    message: 'Your charging session at Station A has started.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'success',
    message: 'Your payment of $15.00 was successful.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    message: 'Low battery: Consider charging soon.',
    timestamp: '2 days ago',
    read: false,
  },
  {
    id: '4',
    type: 'error',
    message: 'Charging session interrupted at Station B.',
    timestamp: '3 days ago',
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>Unread</Button>
          <Button variant={filter === 'read' ? 'default' : 'outline'} onClick={() => setFilter('read')}>Read</Button>
        </div>
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications found.</p>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center justify-between rounded-md border p-4 ${
                  notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {notification.type === 'info' && <Bell className="h-5 w-5 text-blue-500" />}
                  {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {notification.type === 'warning' && <XCircle className="h-5 w-5 text-yellow-500" />}
                  {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                      Mark as Read
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => deleteNotification(notification.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}