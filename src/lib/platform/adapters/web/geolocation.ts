/**
 * Web geolocation adapter using browser geolocation API
 */

import { 
  GeolocationAdapter, 
  GeolocationOptions, 
  GeolocationPosition, 
  GeolocationPositionError,
  PlatformCapabilities 
} from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class WebGeolocationAdapter extends AbstractBaseAdapter implements GeolocationAdapter {
  private watchIds: Map<string, number> = new Map();

  async initialize(): Promise<void> {
    try {
      const hasGeolocation = !!navigator.geolocation;
      this.setAvailable(hasGeolocation);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize web geolocation:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      hasGeolocation: this.isAvailable(),
    };
  }

  async getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Geolocation not supported',
        'web',
        'GEOLOCATION_UNSUPPORTED',
        false
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(this.convertPosition(position));
        },
        (error) => {
          reject(this.convertError(error));
        },
        this.convertOptions(options)
      );
    });
  }

  async watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options?: GeolocationOptions
  ): Promise<string> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Geolocation not supported',
        'web',
        'GEOLOCATION_UNSUPPORTED',
        false
      );
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback(this.convertPosition(position));
      },
      (error) => {
        if (errorCallback) {
          errorCallback(this.convertError(error));
        }
      },
      this.convertOptions(options)
    );

    const stringId = `watch_${watchId}_${Date.now()}`;
    this.watchIds.set(stringId, watchId);
    
    return stringId;
  }

  async clearWatch(watchId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Geolocation not supported',
        'web',
        'GEOLOCATION_UNSUPPORTED',
        false
      );
    }

    const nativeWatchId = this.watchIds.get(watchId);
    if (nativeWatchId !== undefined) {
      navigator.geolocation.clearWatch(nativeWatchId);
      this.watchIds.delete(watchId);
    }
  }

  private convertPosition(position: globalThis.GeolocationPosition): GeolocationPosition {
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
      },
      timestamp: position.timestamp,
    };
  }

  private convertError(error: globalThis.GeolocationPositionError): GeolocationPositionError {
    let message: string;
    let code: number;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Geolocation permission denied';
        code = 1;
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Geolocation position unavailable';
        code = 2;
        break;
      case error.TIMEOUT:
        message = 'Geolocation request timeout';
        code = 3;
        break;
      default:
        message = error.message || 'Unknown geolocation error';
        code = error.code;
    }

    return { code, message };
  }

  private convertOptions(options?: GeolocationOptions): globalThis.PositionOptions | undefined {
    if (!options) return undefined;

    return {
      enableHighAccuracy: options.enableHighAccuracy,
      timeout: options.timeout,
      maximumAge: options.maximumAge,
    };
  }
}