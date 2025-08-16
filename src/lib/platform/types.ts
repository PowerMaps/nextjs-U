/**
 * Platform detection and adapter types for universal app deployment
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
  hasFileSystem: boolean;
}

export interface PlatformDetector {
  isNative(): boolean;
  isWeb(): boolean;
  getPlatform(): Platform;
  getCapabilities(): PlatformCapabilities;
}

// Base adapter interface
export interface BaseAdapter {
  initialize(): Promise<void>;
  isAvailable(): boolean;
  getCapabilities(): Partial<PlatformCapabilities>;
}

// Storage adapter interface
export interface StorageAdapter extends BaseAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// HTTP client interface
export interface HttpClient extends BaseAdapter {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

// Notification adapter interface
export interface NotificationAdapter extends BaseAdapter {
  requestPermission(): Promise<boolean>;
  scheduleLocal(notification: LocalNotification): Promise<string>;
  cancelLocal(id: string): Promise<void>;
  registerForPush(): Promise<string | null>;
  onNotificationReceived(callback: (notification: any) => void): void;
}

export interface LocalNotification {
  title: string;
  body: string;
  id?: string;
  schedule?: {
    at: Date;
  };
}

// Geolocation adapter interface
export interface GeolocationAdapter extends BaseAdapter {
  getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition>;
  watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options?: GeolocationOptions
  ): Promise<string>;
  clearWatch(watchId: string): Promise<void>;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
}

export interface GeolocationPositionError {
  code: number;
  message: string;
}

// Camera adapter interface
export interface CameraAdapter extends BaseAdapter {
  getPhoto(options?: CameraOptions): Promise<CameraPhoto>;
  requestPermissions(): Promise<boolean>;
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: 'base64' | 'uri' | 'dataUrl';
  source?: 'camera' | 'photos' | 'prompt';
}

export interface CameraPhoto {
  base64String?: string;
  dataUrl?: string;
  path?: string;
  webPath?: string;
  format: string;
}

// Device adapter interface
export interface DeviceAdapter extends BaseAdapter {
  getInfo(): Promise<DeviceInfo>;
  getBatteryInfo(): Promise<BatteryInfo>;
}

export interface DeviceInfo {
  model: string;
  platform: Platform;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
}

export interface BatteryInfo {
  batteryLevel?: number;
  isCharging?: boolean;
}

// Adapter registry interface
export interface AdapterRegistry {
  storage: StorageAdapter;
  http: HttpClient;
  notifications: NotificationAdapter;
  geolocation: GeolocationAdapter;
  camera: CameraAdapter;
  device: DeviceAdapter;
}