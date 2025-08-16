/**
 * Web device adapter using browser APIs
 */

import { DeviceAdapter, DeviceInfo, BatteryInfo, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class WebDeviceAdapter extends AbstractBaseAdapter implements DeviceAdapter {
  async initialize(): Promise<void> {
    try {
      // Web platform always has basic device info available
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize web device adapter:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      // Web platform has limited device capabilities
    };
  }

  async getInfo(): Promise<DeviceInfo> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Device info not available',
        'web',
        'DEVICE_INFO_UNAVAILABLE',
        false
      );
    }

    try {
      const userAgent = navigator.userAgent;
      const platform = this.detectPlatform(userAgent);
      const osInfo = this.detectOS(userAgent);

      return {
        model: this.detectModel(userAgent),
        platform: 'web',
        operatingSystem: osInfo.name,
        osVersion: osInfo.version,
        manufacturer: this.detectManufacturer(userAgent),
        isVirtual: false, // Web browsers are not considered virtual devices
      };
    } catch (error) {
      throw new PlatformError(
        'Failed to get device info',
        'web',
        'DEVICE_INFO_ERROR',
        true
      );
    }
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Device info not available',
        'web',
        'DEVICE_INFO_UNAVAILABLE',
        false
      );
    }

    try {
      // Battery API is deprecated and not widely supported
      // @ts-ignore - Battery API types are not standard
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        return {
          batteryLevel: Math.round(battery.level * 100),
          isCharging: battery.charging,
        };
      } else {
        // Return empty battery info if not supported
        return {};
      }
    } catch (error) {
      console.warn('Battery API not supported:', error);
      return {};
    }
  }

  private detectPlatform(userAgent: string): 'web' {
    return 'web';
  }

  private detectOS(userAgent: string): { name: string; version: string } {
    const ua = userAgent.toLowerCase();

    if (ua.includes('windows nt')) {
      const match = ua.match(/windows nt ([\d.]+)/);
      const version = match ? match[1] : 'Unknown';
      return { name: 'Windows', version };
    }

    if (ua.includes('mac os x')) {
      const match = ua.match(/mac os x ([\d_]+)/);
      const version = match ? match[1].replace(/_/g, '.') : 'Unknown';
      return { name: 'macOS', version };
    }

    if (ua.includes('linux')) {
      return { name: 'Linux', version: 'Unknown' };
    }

    if (ua.includes('android')) {
      const match = ua.match(/android ([\d.]+)/);
      const version = match ? match[1] : 'Unknown';
      return { name: 'Android', version };
    }

    if (ua.includes('iphone') || ua.includes('ipad')) {
      const match = ua.match(/os ([\d_]+)/);
      const version = match ? match[1].replace(/_/g, '.') : 'Unknown';
      return { name: 'iOS', version };
    }

    return { name: 'Unknown', version: 'Unknown' };
  }

  private detectModel(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    // Try to extract device model from user agent
    if (ua.includes('iphone')) {
      return 'iPhone';
    }

    if (ua.includes('ipad')) {
      return 'iPad';
    }

    if (ua.includes('android')) {
      // Try to extract Android device model
      const modelMatch = ua.match(/\(([^)]+)\)/);
      if (modelMatch) {
        const deviceInfo = modelMatch[1];
        const parts = deviceInfo.split(';');
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed && !trimmed.includes('android') && !trimmed.includes('mobile') && !trimmed.includes('wv')) {
            return trimmed;
          }
        }
      }
      return 'Android Device';
    }

    // For desktop browsers, return browser name
    if (ua.includes('chrome')) {
      return 'Chrome Browser';
    }

    if (ua.includes('firefox')) {
      return 'Firefox Browser';
    }

    if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari Browser';
    }

    if (ua.includes('edge')) {
      return 'Edge Browser';
    }

    return 'Unknown Device';
  }

  private detectManufacturer(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('mac')) {
      return 'Apple';
    }

    if (ua.includes('samsung')) {
      return 'Samsung';
    }

    if (ua.includes('huawei')) {
      return 'Huawei';
    }

    if (ua.includes('xiaomi')) {
      return 'Xiaomi';
    }

    if (ua.includes('oneplus')) {
      return 'OnePlus';
    }

    if (ua.includes('pixel')) {
      return 'Google';
    }

    if (ua.includes('windows')) {
      return 'Microsoft';
    }

    if (ua.includes('linux')) {
      return 'Linux';
    }

    return 'Unknown';
  }
}