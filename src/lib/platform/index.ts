/**
 * Universal platform adapter system
 * 
 * This module provides a unified interface for platform-specific functionality
 * across web, iOS, and Android platforms using conditional imports and adapters.
 */

// Core types and interfaces
export * from './types';

// Platform detection utilities
export * from './detector';

// Adapter registry
export * from './registry';

// Base adapter classes
export * from './base-adapter';

// Convenience re-exports for common use cases
export {
  getStorageAdapter,
  getHttpClient,
  getNotificationAdapter,
  getGeolocationAdapter,
  getCameraAdapter,
  getDeviceAdapter,
} from './registry';

export {
  isNative,
  isWeb,
  getPlatform,
  getCapabilities,
} from './detector';