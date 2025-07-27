/**
 * Platform detection utilities for identifying web vs native environments
 */

import type { Platform, PlatformCapabilities, PlatformDetector } from './types';

class PlatformDetectorImpl implements PlatformDetector {
  private _platform: Platform | null = null;
  private _capabilities: PlatformCapabilities | null = null;

  /**
   * Detects if the app is running in a native Capacitor environment
   */
  isNative(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check for Capacitor global object
    return !!(window as any).Capacitor;
  }

  /**
   * Detects if the app is running in a web browser
   */
  isWeb(): boolean {
    return !this.isNative();
  }

  /**
   * Gets the current platform (web, ios, or android)
   */
  getPlatform(): Platform {
    if (this._platform) {
      return this._platform;
    }

    if (this.isWeb()) {
      this._platform = 'web';
      return this._platform;
    }

    // For native environments, check Capacitor platform info
    const capacitor = (window as any).Capacitor;
    if (capacitor?.getPlatform) {
      const platform = capacitor.getPlatform();
      this._platform = platform === 'ios' ? 'ios' : 'android';
    } else {
      // Fallback detection based on user agent
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        this._platform = 'ios';
      } else {
        this._platform = 'android';
      }
    }

    return this._platform;
  }

  /**
   * Gets platform-specific capabilities
   */
  getCapabilities(): PlatformCapabilities {
    if (this._capabilities) {
      return this._capabilities;
    }

    const platform = this.getPlatform();
    
    if (platform === 'web') {
      this._capabilities = {
        hasCamera: this.hasWebCamera(),
        hasGeolocation: this.hasWebGeolocation(),
        hasNotifications: this.hasWebNotifications(),
        hasStorage: this.hasWebStorage(),
        hasBiometrics: false, // Not available in web
        hasAppState: false, // Not available in web
        hasBackgroundSync: this.hasServiceWorker(),
        hasNativeSharing: this.hasWebShare(),
      };
    } else {
      // Native capabilities - assume all are available when Capacitor is present
      // These will be refined when actual Capacitor plugins are integrated
      this._capabilities = {
        hasCamera: true,
        hasGeolocation: true,
        hasNotifications: true,
        hasStorage: true,
        hasBiometrics: true,
        hasAppState: true,
        hasBackgroundSync: true,
        hasNativeSharing: true,
      };
    }

    return this._capabilities;
  }

  /**
   * Resets cached platform detection (useful for testing)
   */
  reset(): void {
    this._platform = null;
    this._capabilities = null;
  }

  // Private helper methods for web capability detection

  private hasWebCamera(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private hasWebGeolocation(): boolean {
    return !!navigator.geolocation;
  }

  private hasWebNotifications(): boolean {
    return 'Notification' in window;
  }

  private hasWebStorage(): boolean {
    try {
      return typeof Storage !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }

  private hasServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  }

  private hasWebShare(): boolean {
    return !!(navigator as any).share;
  }
}

// Export singleton instance
export const platformDetector = new PlatformDetectorImpl();

// Export class for testing
export { PlatformDetectorImpl };