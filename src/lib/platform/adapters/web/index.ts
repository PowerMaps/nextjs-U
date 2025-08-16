/**
 * Web platform adapters
 */

import { AdapterRegistry } from '../../types';
import { WebStorageAdapter } from './storage';
import { WebHttpClient } from './http';
import { WebNotificationAdapter } from './notifications';
import { WebGeolocationAdapter } from './geolocation';
import { WebCameraAdapter } from './camera';
import { WebDeviceAdapter } from './device';

export async function createWebAdapterRegistry(): Promise<AdapterRegistry> {
  const storage = new WebStorageAdapter();
  const http = new WebHttpClient();
  const notifications = new WebNotificationAdapter();
  const geolocation = new WebGeolocationAdapter();
  const camera = new WebCameraAdapter();
  const device = new WebDeviceAdapter();

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
  WebStorageAdapter,
  WebHttpClient,
  WebNotificationAdapter,
  WebGeolocationAdapter,
  WebCameraAdapter,
  WebDeviceAdapter,
};