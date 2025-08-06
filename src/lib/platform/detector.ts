/**
 * Platform detection utilities for universal app deployment
 */

import { Capacitor } from '@capacitor/core';
import type { Platform, PlatformDetector, PlatformCapabilities } from './types';

class UniversalPlatformDetector implements PlatformDetector {
  private _platform: Platform | null = null;
  private _capabilities: PlatformCapabilities | null = null;

  /**
   * Check if running in native Capacitor environment
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Check if running in web browser
   */
  isWeb(): boolean {
    return !this.isNative();
  }

  /**
   * Get the current platform
   */
  getPlatform(): Platform {
    if (this._platform) {
      return this._platform;
    }

    if (this.isNative()) {
      const platform = Capacitor.getPlatform();
      this._platform = platform as Platform;
    } else {
      this._platform = 'web';
    }

    return this._platform;
  }

  /**
   * Get platform capabilities
   */
  getCapabilities(): PlatformCapabilities {
    if (this._capabilities) {
      return this._capabilities;
    }

    const platform = this.getPlatform();
    
    this._capabilities = {
      hasCamera: this.isNative(),
      hasGeolocation: true, // Available on all platforms
      hasNotifications: this.isNative() || this.hasWebNotificationSupport(),
      hasStorage: true, // Available on all platforms
      hasBiometrics: this.isNative(),
      hasAppState: this.isNative(),
      hasNetwork: true, // Available on all platforms
      hasDevice: this.isNative()
    };

    return this._capabilities;
  }

  /**
   * Check if web notifications are supported
   */
  private hasWebNotificationSupport(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Reset cached values (useful for testing)
   */
  reset(): void {
    this._platform = null;
    this._capabilities = null;
  }
}

// Export singleton instance
export const platformDetector = new UniversalPlatformDetector();

// Export class for testing
export { UniversalPlatformDetector };