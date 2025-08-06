/**
 * Platform detection and conditional import types
 */

export type Platform = 'web' | 'ios' | 'android';

export interface PlatformCapabilities {
  hasCamera: boolean;
  hasGeolocation: boolean;
  hasNotifications: boolean;
  hasStorage: boolean;
  hasBiometrics: boolean;
  hasAppState: boolean;
  hasNetwork: boolean;
  hasDevice: boolean;
}

export interface PlatformDetector {
  isNative(): boolean;
  isWeb(): boolean;
  getPlatform(): Platform;
  getCapabilities(): PlatformCapabilities;
}

export interface PlatformAdapter<T> {
  web: () => Promise<T>;
  native: () => Promise<T>;
}

export interface PlatformConfig {
  platform: Platform;
  apiBaseUrl: string;
  storagePrefix: string;
  enabledFeatures: FeatureFlags;
  buildTarget: 'development' | 'production';
}

export interface FeatureFlags {
  pushNotifications: boolean;
  biometricAuth: boolean;
  backgroundSync: boolean;
  offlineMode: boolean;
  nativeSharing: boolean;
  camera: boolean;
  geolocation: boolean;
}