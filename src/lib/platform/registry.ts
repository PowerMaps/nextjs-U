/**
 * Adapter registry for managing platform-specific implementations
 */

import { AdapterRegistry, Platform } from './types';
import { platformDetector } from './detector';

class UniversalAdapterRegistry {
  private _registry: AdapterRegistry | null = null;
  private _platform: Platform | null = null;

  async getRegistry(): Promise<AdapterRegistry> {
    if (this._registry && this._platform === platformDetector.getPlatform()) {
      return this._registry;
    }

    const platform = platformDetector.getPlatform();
    this._platform = platform;

    if (platformDetector.isNative()) {
      // Load native adapters
      const { createNativeAdapterRegistry } = await import('./adapters/native');
      this._registry = await createNativeAdapterRegistry();
    } else {
      // Load web adapters
      const { createWebAdapterRegistry } = await import('./adapters/web');
      this._registry = await createWebAdapterRegistry();
    }

    return this._registry;
  }

  async getStorage() {
    const registry = await this.getRegistry();
    return registry.storage;
  }

  async getHttp() {
    const registry = await this.getRegistry();
    return registry.http;
  }

  async getNotifications() {
    const registry = await this.getRegistry();
    return registry.notifications;
  }

  async getGeolocation() {
    const registry = await this.getRegistry();
    return registry.geolocation;
  }

  async getCamera() {
    const registry = await this.getRegistry();
    return registry.camera;
  }

  async getDevice() {
    const registry = await this.getRegistry();
    return registry.device;
  }

  // Reset registry (useful for testing or platform changes)
  reset(): void {
    this._registry = null;
    this._platform = null;
  }
}

// Export singleton instance
export const adapterRegistry = new UniversalAdapterRegistry();

// Export class for testing
export { UniversalAdapterRegistry };

// Convenience functions
export async function getStorageAdapter() {
  return adapterRegistry.getStorage();
}

export async function getHttpClient() {
  return adapterRegistry.getHttp();
}

export async function getNotificationAdapter() {
  return adapterRegistry.getNotifications();
}

export async function getGeolocationAdapter() {
  return adapterRegistry.getGeolocation();
}

export async function getCameraAdapter() {
  return adapterRegistry.getCamera();
}

export async function getDeviceAdapter() {
  return adapterRegistry.getDevice();
}