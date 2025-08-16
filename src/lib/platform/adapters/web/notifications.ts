/**
 * Web notification adapter using browser Notification API
 */

import { NotificationAdapter, LocalNotification, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class WebNotificationAdapter extends AbstractBaseAdapter implements NotificationAdapter {
  private notificationCallbacks: ((notification: any) => void)[] = [];

  async initialize(): Promise<void> {
    try {
      const hasNotificationSupport = 'Notification' in window;
      this.setAvailable(hasNotificationSupport);
      this.setInitialized(true);

      if (hasNotificationSupport) {
        // Set up service worker message listener for push notifications
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
              this.notificationCallbacks.forEach(callback => callback(event.data.notification));
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to initialize web notifications:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      hasNotifications: this.isAvailable(),
    };
  }

  async requestPermission(): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Notifications not supported',
        'web',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      throw new PlatformError(
        'Failed to request notification permission',
        'web',
        'NOTIFICATION_PERMISSION_ERROR',
        true
      );
    }
  }

  async scheduleLocal(notification: LocalNotification): Promise<string> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Notifications not supported',
        'web',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    if (Notification.permission !== 'granted') {
      throw new PlatformError(
        'Notification permission not granted',
        'web',
        'NOTIFICATION_PERMISSION_DENIED',
        true,
        () => this.requestPermission()
      );
    }

    try {
      const id = notification.id || `notification_${Date.now()}_${Math.random()}`;
      
      if (notification.schedule?.at) {
        // Schedule for later using setTimeout
        const delay = notification.schedule.at.getTime() - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            new Notification(notification.title, {
              body: notification.body,
              tag: id,
              icon: '/icon-192x192.png', // You might want to make this configurable
            });
          }, delay);
        } else {
          // Schedule time has passed, show immediately
          new Notification(notification.title, {
            body: notification.body,
            tag: id,
            icon: '/icon-192x192.png',
          });
        }
      } else {
        // Show immediately
        new Notification(notification.title, {
          body: notification.body,
          tag: id,
          icon: '/icon-192x192.png',
        });
      }

      return id;
    } catch (error) {
      throw new PlatformError(
        'Failed to schedule local notification',
        'web',
        'NOTIFICATION_SCHEDULE_ERROR',
        true
      );
    }
  }

  async cancelLocal(id: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Notifications not supported',
        'web',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    // Note: Web Notification API doesn't provide a direct way to cancel scheduled notifications
    // This is a limitation of the web platform
    console.warn('Web platform does not support canceling scheduled notifications');
  }

  async registerForPush(): Promise<string | null> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Notifications not supported',
        'web',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new PlatformError(
          'Push notifications not supported',
          'web',
          'PUSH_UNSUPPORTED',
          false
        );
      }

      const registration = await navigator.serviceWorker.ready;
      
      // You would need to provide your VAPID public key here
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      return JSON.stringify(subscription);
    } catch (error) {
      throw new PlatformError(
        'Failed to register for push notifications',
        'web',
        'PUSH_REGISTRATION_ERROR',
        true
      );
    }
  }

  onNotificationReceived(callback: (notification: any) => void): void {
    this.notificationCallbacks.push(callback);
  }
}