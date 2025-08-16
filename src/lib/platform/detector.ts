/**
 * Platform detection utilities for universal app deployment
 */

import { Platform, PlatformCapabilities, PlatformDetector } from './types';

class UniversalPlatformDetector implements PlatformDetector {
  private _platform: Platform | null = null;
  private _capabilities: PlatformCapabilities | null = null;

  isNative(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for Capacitor
    return !!(window as any).Capacitor;
  }

  isWeb(): boolean {
    return !this.isNative();
  }

  getPlatform(): Platform {
    if (this._platform) return this._platform;

    if (typeof window === 'undefined') {
      this._platform = 'web';
      return this._platform;
    }

    if (this.isNative()) {
      const capacitor = (window as any).Capacitor;
      if (capacitor?.getPlatform) {
        const platform = capacitor.getPlatform();
        this._platform = platform === 'ios' ? 'ios' : 'android';
      } else {
        // Fallback detection
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
          this._platform = 'ios';
        } else if (userAgent.includes('android')) {
          this._platform = 'android';
        } else {
          this._platform = 'web';
        }
      }
    } else {
      this._platform = 'web';
    }

    return this._platform;
  }

  getCapabilities(): PlatformCapabilities {
    if (this._capabilities) return this._capabilities;

    const platform = this.getPlatform();
    const isNative = this.isNative();

    this._capabilities = {
      hasCamera: isNative || this.hasWebCamera(),
      hasGeolocation: isNative || this.hasWebGeolocation(),
      hasNotifications: isNative || this.hasWebNotifications(),
      hasStorage: true, // All platforms have some form of storage
      hasBiometrics: isNative, // Only native platforms support biometrics
      hasAppState: isNative || this.hasWebAppState(),
      hasNetwork: true, // All platforms have network capabilities
      hasFileSystem: isNative || this.hasWebFileSystem(),
    };

    return this._capabilities;
  }

  private hasWebCamera(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private hasWebGeolocation(): boolean {
    return !!navigator.geolocation;
  }

  private hasWebNotifications(): boolean {
    return 'Notification' in window;
  }

  private hasWebAppState(): boolean {
    return 'visibilityState' in document;
  }

  private hasWebFileSystem(): boolean {
    return !!(window.File && window.FileReader && window.FileList && window.Blob);
  }

  // Reset cached values (useful for testing)
  reset(): void {
    this._platform = null;
    this._capabilities = null;
  }
}

// Export singleton instance
export const platformDetector = new UniversalPlatformDetector();

// Export class for testing
export { UniversalPlatformDetector };

// Utility functions
export function isNative(): boolean {
  return platformDetector.isNative();
}

export function isWeb(): boolean {
  return platformDetector.isWeb();
}

export function getPlatform(): Platform {
  return platformDetector.getPlatform();
}

export function getCapabilities(): PlatformCapabilities {
  return platformDetector.getCapabilities();
}