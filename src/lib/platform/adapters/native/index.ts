/**
 * Native platform adapters using Capacitor plugins
 */

import { AdapterRegistry } from '../../types';
import { NativeStorageAdapter } from './storage';
import { NativeHttpClient } from './http';
import { NativeNotificationAdapter } from './notifications';
import { NativeGeolocationAdapter } from './geolocation';
import { NativeCameraAdapter } from './camera';
import { NativeDeviceAdapter } from './device';

export async function createNativeAdapterRegistry(): Promise<AdapterRegistry> {
  const storage = new NativeStorageAdapter();
  const http = new NativeHttpClient();
  const notifications = new NativeNotificationAdapter();
  const geolocation = new NativeGeolocationAdapter();
  const camera = new NativeCameraAdapter();
  const device = new NativeDeviceAdapter();

  // Initialize all adapters
  await Promise.all([
    storage.initialize(),
    http.initialize(),
    notifications.initialize(),
    geolocation.initialize(),
    camera.initialize(),
    device.initialize(),
  ]);

  return {
    storage,
    http,
    notifications,
    geolocation,
    camera,
    device,
  };
}

export {
  NativeStorageAdapter,
  NativeHttpClient,
  NativeNotificationAdapter,
  NativeGeolocationAdapter,
  NativeCameraAdapter,
  NativeDeviceAdapter,
};