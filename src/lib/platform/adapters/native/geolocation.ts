/**
 * Native geolocation adapter using Capacitor Geolocation
 */

import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { 
  GeolocationAdapter, 
  GeolocationOptions, 
  GeolocationPosition, 
  GeolocationPositionError,
  PlatformCapabilities 
} from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class NativeGeolocationAdapter extends AbstractBaseAdapter implements GeolocationAdapter {
  private watchIds: Map<string, string> = new Map();

  async initialize(): Promise<void> {
    try {
      // Test geolocation availability by checking permissions
      await Geolocation.checkPermissions();
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize native geolocation:', error);
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
        'native',
        'GEOLOCATION_UNSUPPORTED',
        false
      );
    }

    try {
      // Check and request permissions if needed
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new PlatformError(
            'Geolocation permission denied',
            'native',
            'GEOLOCATION_PERMISSION_DENIED',
            false
          );
        }
      }

      const position: Position = await Geolocation.getCurrentPosition(
        this.convertOptions(options)
      );
      
      return this.convertPosition(position);
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `Failed to get current position: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'GEOLOCATION_ERROR',
        true
      );
    }
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
        'native',
        'GEOLOCATION_UNSUPPORTED',
        false
      );
    }

    try {
      // Check and request permissions if needed
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new PlatformError(
            'Geolocation permission denied',
            'native',
            'GEOLOCATION_PERMISSION_DENIED',
            false
          );
        }
      }

      const watchId = await Geolocation.watchPosition(
        this.convertOptions(options),
        (position: Position | null, error?: any) => {
          if (error) {
            if (errorCallback) {
              errorCallback(this.convertError(error));
            }
          } else if (position) {
            callback(this.convertPosition(position));
          }
        }
      );

      const stringId = `watch_${watchId}_${Date.now()}`;
      this.watchIds.set(stringId, watchId);
      
      return stringId;
    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      throw new PlatformError(
        `Failed to watch position: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'GEOLOCATION_WATCH_ERROR',
        true
      );
    }
  }

  async clearWatch(watchId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Geolocation not supported',
        'native',
        'GEOLOCATION_UNSUPPORTED',
        false
      );
    }

    try {
      const nativeWatchId = this.watchIds.get(watchId);
      if (nativeWatchId) {
        await Geolocation.clearWatch({ id: nativeWatchId });
        this.watchIds.delete(watchId);
      }
    } catch (error) {
      throw new PlatformError(
        `Failed to clear watch: ${error instanceof Error ? error.message : String(error)}`,
        'native',
        'GEOLOCATION_CLEAR_WATCH_ERROR',
        true
      );
    }
  }

  private convertPosition(position: Position): GeolocationPosition {
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

  private convertError(error: any): GeolocationPositionError {
    // Map Capacitor geolocation errors to standard format
    let code = 0;
    let message = 'Unknown geolocation error';

    if (error.message) {
      message = error.message;
      
      if (message.includes('permission')) {
        code = 1; // PERMISSION_DENIED
      } else if (message.includes('unavailable')) {
        code = 2; // POSITION_UNAVAILABLE
      } else if (message.includes('timeout')) {
        code = 3; // TIMEOUT
      }
    }

    return { code, message };
  }

  private convertOptions(options?: GeolocationOptions): PositionOptions {
    if (!options) {
      return {
        enableHighAccuracy: true,
        timeout: 10000,
      };
    }

    return {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 0,
    };
  }
}