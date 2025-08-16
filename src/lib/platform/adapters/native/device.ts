/**
 * Native device adapter using Capacitor Device
 */

import { Device, DeviceInfo as CapacitorDeviceInfo, BatteryInfo as CapacitorBatteryInfo } from '@capacitor/device';
import { DeviceAdapter, DeviceInfo, BatteryInfo, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class NativeDeviceAdapter extends AbstractBaseAdapter implements DeviceAdapter {
  async initialize(): Promise<void> {
    try {
      // Device info is always available in native context
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize native device adapter:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      // Native device adapter provides comprehensive device info
    };
  }

  async getInfo(): Promise<DeviceInfo> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Device info not available',
        'native',
        'DEVICE_INFO_UNAVAILABLE',
        false
      );
    }

    try {
      const info: CapacitorDeviceInfo = await Device.getInfo();
      
      return {
        model: info.model,
        platform: info.platform === 'ios' ? 'ios' : 'android',
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
      };
    } catch (error) {
      throw new PlatformError(
        'Failed to get device info',
        'native',
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
        'native',
        'DEVICE_INFO_UNAVAILABLE',
        false
      );
    }

    try {
      const batteryInfo: CapacitorBatteryInfo = await Device.getBatteryInfo();
      
      return {
        batteryLevel: batteryInfo.batteryLevel ? Math.round(batteryInfo.batteryLevel * 100) : undefined,
        isCharging: batteryInfo.isCharging,
      };
    } catch (error) {
      throw new PlatformError(
        'Failed to get battery info',
        'native',
        'BATTERY_INFO_ERROR',
        true
      );
    }
  }
}