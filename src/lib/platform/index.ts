/**
 * Platform detection and conditional import system
 * Entry point for universal app platform utilities
 */

export { platformDetector, UniversalPlatformDetector } from './detector';
export { 
  importPlatformModule, 
  createPlatformAdapter, 
  executePlatformSpecific,
  getPlatformConfig 
} from './conditional-imports';
export type { 
  Platform, 
  PlatformDetector, 
  PlatformCapabilities, 
  PlatformAdapter,
  PlatformConfig,
  FeatureFlags 
} from './types';

// Re-export commonly used utilities
import { platformDetector as detector } from './detector';

export const isNative = () => detector.isNative();
export const isWeb = () => detector.isWeb();
export const getPlatform = () => detector.getPlatform();
export const getCapabilities = () => detector.getCapabilities();