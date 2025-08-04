/**
 * Conditional import system for platform-specific modules
 */

import { platformDetector } from './detector';
import type { PlatformAdapter } from './types';

/**
 * Dynamically import platform-specific implementation
 */
export async function importPlatformModule<T>(adapter: PlatformAdapter<T>): Promise<T> {
  try {
    if (platformDetector.isNative()) {
      const module = await adapter.native();
      return module;
    } else {
      const module = await adapter.web();
      return module;
    }
  } catch (error) {
    console.error('Failed to import platform module:', error);
    // Fallback to web implementation if native fails
    if (platformDetector.isNative()) {
      console.warn('Falling back to web implementation');
      return await adapter.web();
    }
    throw error;
  }
}

/**
 * Create a platform adapter with lazy loading
 */
export function createPlatformAdapter<T>(
  webImport: () => Promise<T>,
  nativeImport: () => Promise<T>
): PlatformAdapter<T> {
  return {
    web: webImport,
    native: nativeImport
  };
}

/**
 * Execute platform-specific code
 */
export function executePlatformSpecific<T>(
  webFn: () => T,
  nativeFn: () => T
): T {
  if (platformDetector.isNative()) {
    return nativeFn();
  } else {
    return webFn();
  }
}

/**
 * Get platform-specific configuration
 */
export function getPlatformConfig<T>(config: {
  web: T;
  native: T;
  ios?: T;
  android?: T;
}): T {
  const platform = platformDetector.getPlatform();
  
  if (platform === 'ios' && config.ios) {
    return config.ios;
  }
  
  if (platform === 'android' && config.android) {
    return config.android;
  }
  
  if (platformDetector.isNative()) {
    return config.native;
  }
  
  return config.web;
}