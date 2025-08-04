/**
 * Usage examples for platform detection and conditional imports
 */

import { 
  platformDetector, 
  importPlatformModule, 
  createPlatformAdapter,
  executePlatformSpecific,
  getPlatformConfig,
  isNative,
  getPlatform 
} from '../index';

// Example 1: Basic platform detection
export function basicPlatformDetection() {
  console.log('Platform:', getPlatform());
  console.log('Is Native:', isNative());
  console.log('Capabilities:', platformDetector.getCapabilities());
}

// Example 2: Platform-specific configuration
export function getPlatformSpecificConfig() {
  const config = getPlatformConfig({
    web: {
      apiUrl: 'https://web-api.example.com',
      timeout: 5000
    },
    native: {
      apiUrl: 'https://mobile-api.example.com',
      timeout: 10000
    },
    android: {
      apiUrl: 'https://android-api.example.com',
      timeout: 8000
    },
    ios: {
      apiUrl: 'https://ios-api.example.com',
      timeout: 8000
    }
  });
  
  return config;
}

// Example 3: Conditional imports for storage
interface StorageService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

// Example storage adapter (commented out until adapters are implemented)
// const storageAdapter = createPlatformAdapter<StorageService>(
//   // Web implementation
//   async () => {
//     const { WebStorageService } = await import('../adapters/web-storage');
//     return new WebStorageService();
//   },
//   // Native implementation
//   async () => {
//     const { NativeStorageService } = await import('../adapters/native-storage');
//     return new NativeStorageService();
//   }
// );

// export async function getStorageService(): Promise<StorageService> {
//   return await importPlatformModule(storageAdapter);
// }

// Example 4: Platform-specific execution
export function showPlatformSpecificAlert(message: string) {
  return executePlatformSpecific(
    // Web implementation
    () => {
      alert(message);
    },
    // Native implementation
    () => {
      // Use native alert dialog
      console.log('Native alert:', message);
    }
  );
}

// Example 5: Feature availability check
export function checkFeatureAvailability() {
  const capabilities = platformDetector.getCapabilities();
  
  return {
    canTakePhotos: capabilities.hasCamera,
    canSendNotifications: capabilities.hasNotifications,
    canUseBiometrics: capabilities.hasBiometrics,
    canAccessLocation: capabilities.hasGeolocation
  };
}

// Example 6: Platform-specific styling
export function getPlatformStyles() {
  return getPlatformConfig({
    web: {
      container: 'max-w-4xl mx-auto px-4',
      button: 'px-4 py-2 rounded-md hover:bg-gray-100'
    },
    native: {
      container: 'px-4 py-2',
      button: 'px-6 py-3 rounded-lg active:bg-gray-100'
    },
    ios: {
      container: 'px-4 py-2',
      button: 'px-6 py-3 rounded-xl active:bg-gray-100'
    }
  });
}

// Example 7: Conditional API endpoints
export function getApiEndpoints() {
  const platform = getPlatform();
  
  const baseConfig = {
    web: 'https://api.powermaps.com',
    native: 'https://mobile-api.powermaps.com'
  };
  
  return getPlatformConfig(baseConfig);
}