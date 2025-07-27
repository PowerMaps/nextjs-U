/**
 * Usage examples for the platform detection and conditional import system
 */

import {
  isNative,
  isWeb,
  getPlatform,
  getCapabilities,
  createPlatformAdapter,
  conditionalImport,
  conditionalImportWithFallback,
} from '../index';

// Example 1: Basic platform detection
export function basicPlatformDetection() {
  console.log('Is native:', isNative());
  console.log('Is web:', isWeb());
  console.log('Platform:', getPlatform());
  console.log('Capabilities:', getCapabilities());
}

// Example 2: Conditional imports for storage
export const storageAdapter = createPlatformAdapter(
  // Web implementation
  async () => {
    return {
      get: (key: string) => localStorage.getItem(key),
      set: (key: string, value: string) => localStorage.setItem(key, value),
      remove: (key: string) => localStorage.removeItem(key),
    };
  },
  // Native implementation (placeholder - will be implemented when Capacitor is added)
  async () => {
    // This would use @capacitor/preferences when available
    return {
      get: async (key: string) => {
        // Placeholder for Capacitor Preferences.get({ key })
        return null;
      },
      set: async (key: string, value: string) => {
        // Placeholder for Capacitor Preferences.set({ key, value })
      },
      remove: async (key: string) => {
        // Placeholder for Capacitor Preferences.remove({ key })
      },
    };
  }
);

// Example 3: Using conditional import with fallback
export async function getStorageWithFallback() {
  return conditionalImportWithFallback(
    storageAdapter,
    // Fallback to in-memory storage
    async () => {
      const memoryStorage = new Map<string, string>();
      return {
        get: (key: string) => memoryStorage.get(key) || null,
        set: (key: string, value: string) => memoryStorage.set(key, value),
        remove: (key: string) => memoryStorage.delete(key),
      };
    }
  );
}

// Example 4: Platform-specific HTTP client
export const httpAdapter = createPlatformAdapter(
  // Web implementation using axios (existing)
  async () => {
    const axios = await import('axios');
    return axios.default;
  },
  // Native implementation (placeholder - will use Capacitor HTTP when available)
  async () => {
    // This would use @capacitor/http when available
    return {
      get: async (url: string) => {
        // Placeholder for Capacitor Http.get({ url })
        throw new Error('Capacitor HTTP not yet implemented');
      },
      post: async (url: string, data: any) => {
        // Placeholder for Capacitor Http.post({ url, data })
        throw new Error('Capacitor HTTP not yet implemented');
      },
    };
  }
);

// Example 5: Platform-aware component rendering
export function renderPlatformSpecificUI() {
  const platform = getPlatform();
  const capabilities = getCapabilities();

  if (platform === 'web') {
    return {
      showWebSpecificFeatures: true,
      enableServiceWorker: capabilities.hasBackgroundSync,
      showInstallPrompt: true,
    };
  } else {
    return {
      showNativeSpecificFeatures: true,
      enableBiometrics: capabilities.hasBiometrics,
      showAppStoreRating: true,
    };
  }
}