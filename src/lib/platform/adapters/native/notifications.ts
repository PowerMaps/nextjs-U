/**
 * Native notification adapter using Capacitor Push Notifications
 */

import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { NotificationAdapter, LocalNotification, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class NativeNotificationAdapter extends AbstractBaseAdapter implements NotificationAdapter {
  private notificationCallbacks: ((notification: any) => void)[] = [];

  async initialize(): Promise<void> {
    try {
      // Set up push notification listeners
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        this.notificationCallbacks.forEach(callback => callback(notification));
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        this.notificationCallbacks.forEach(callback => callback(notification.notification));
      });

      // Set up local notification listeners
      LocalNotifications.addListener('localNotificationReceived', (notification: LocalNotificationSchema) => {
        this.notificationCallbacks.forEach(callback => callback(notification));
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction: any) => {
        this.notificationCallbacks.forEach(callback => callback(notificationAction.notification));
      });

      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize native notifications:', error);
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
        'native',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    try {
      // Request permissions for both push and local notifications
      const pushPermission = await PushNotifications.requestPermissions();
      const localPermission = await LocalNotifications.requestPermissions();
      
      return pushPermission.receive === 'granted' || localPermission.display === 'granted';
    } catch (error) {
      throw new PlatformError(
        'Failed to request notification permission',
        'native',
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
        'native',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    try {
      const id = notification.id || Date.now().toString();
      
      const localNotification: LocalNotificationSchema = {
        title: notification.title,
        body: notification.body,
        id: parseInt(id),
        schedule: notification.schedule ? {
          at: notification.schedule.at,
        } : undefined,
        sound: 'default',
        attachments: undefined,
        actionTypeId: '',
        extra: null,
      };

      await LocalNotifications.schedule({
        notifications: [localNotification],
      });

      return id;
    } catch (error) {
      throw new PlatformError(
        'Failed to schedule local notification',
        'native',
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
        'native',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: parseInt(id) }],
      });
    } catch (error) {
      throw new PlatformError(
        'Failed to cancel local notification',
        'native',
        'NOTIFICATION_CANCEL_ERROR',
        true
      );
    }
  }

  async registerForPush(): Promise<string | null> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Notifications not supported',
        'native',
        'NOTIFICATIONS_UNSUPPORTED',
        false
      );
    }

    try {
      await PushNotifications.register();
      
      // Return a promise that resolves when registration completes
      return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new PlatformError(
            'Push registration timeout',
            'native',
            'PUSH_REGISTRATION_TIMEOUT',
            true
          ));
        }, 10000);

        const registrationListener = await PushNotifications.addListener('registration', (token: Token) => {
          clearTimeout(timeout);
          registrationListener.remove();
          resolve(token.value);
        });

        const errorListener = await PushNotifications.addListener('registrationError', (error: any) => {
          clearTimeout(timeout);
          registrationListener.remove();
          errorListener.remove();
          reject(new PlatformError(
            `Push registration failed: ${JSON.stringify(error)}`,
            'native',
            'PUSH_REGISTRATION_ERROR',
            true
          ));
        });
      });
    } catch (error) {
      throw new PlatformError(
        'Failed to register for push notifications',
        'native',
        'PUSH_REGISTRATION_ERROR',
        true
      );
    }
  }

  onNotificationReceived(callback: (notification: any) => void): void {
    this.notificationCallbacks.push(callback);
  }
}