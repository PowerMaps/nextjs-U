/**
 * Platform detection and conditional import system
 * 
 * This module provides utilities for detecting the current platform (web vs native)
 * and conditionally importing platform-specific modules.
 */

// Export types
export type {
  Platform,
  PlatformCapabilities,
  PlatformDetector,
  PlatformAdapter,
  PlatformConfig,
  FeatureFlags,
} from './types';

// Export platform detector
export { platformDetector, PlatformDetectorImpl } from './detector';

// Export conditional import utilities
export {
  conditionalImport,
  createPlatformAdapter,
  conditionalImportWithFallback,
  createPlatformComponent,
  isPlatformModuleAvailable,
  batchConditionalImport,
  PlatformImportError,
} from './conditional-imports';

// Convenience exports for common use cases
import { platformDetector as detector } from './detector';

export const isNative = () => detector.isNative();
export const isWeb = () => detector.isWeb();
export const getPlatform = () => detector.getPlatform();
export const getCapabilities = () => detector.getCapabilities();