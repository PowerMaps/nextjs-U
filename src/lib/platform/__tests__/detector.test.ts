/**
 * Unit tests for platform detection utilities
 */

import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { PlatformDetectorImpl } from '../detector';

// Mock window object for testing
const mockWindow = (capacitor?: any, userAgent?: string) => {
  const originalWindow = global.window;
  const originalNavigator = global.navigator;

  // @ts-ignore
  delete global.window;
  // @ts-ignore
  delete global.navigator;

  // @ts-ignore
  global.window = {
    Capacitor: capacitor,
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    Notification: class MockNotification {},
  };

  // @ts-ignore
  global.navigator = {
    userAgent: userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    mediaDevices: {
      getUserMedia: jest.fn(),
    },
    geolocation: {
      getCurrentPosition: jest.fn(),
    },
    serviceWorker: {},
    share: jest.fn(),
  };

  return () => {
    // @ts-ignore
    global.window = originalWindow;
    // @ts-ignore
    global.navigator = originalNavigator;
  };
};

describe('PlatformDetectorImpl', () => {
  let detector: PlatformDetectorImpl;
  let cleanup: () => void;

  beforeEach(() => {
    detector = new PlatformDetectorImpl();
    cleanup = mockWindow();
  });

  afterEach(() => {
    cleanup();
    detector.reset();
  });

  describe('isNative()', () => {
    it('should return false when window is undefined (SSR)', () => {
      // @ts-ignore
      global.window = undefined;
      expect(detector.isNative()).toBe(false);
    });

    it('should return false when Capacitor is not present', () => {
      cleanup();
      cleanup = mockWindow();
      expect(detector.isNative()).toBe(false);
    });

    it('should return true when Capacitor is present', () => {
      cleanup();
      cleanup = mockWindow({ getPlatform: () => 'ios' });
      expect(detector.isNative()).toBe(true);
    });
  });

  describe('isWeb()', () => {
    it('should return true when not native', () => {
      cleanup();
      cleanup = mockWindow();
      expect(detector.isWeb()).toBe(true);
    });

    it('should return false when native', () => {
      cleanup();
      cleanup = mockWindow({ getPlatform: () => 'ios' });
      expect(detector.isWeb()).toBe(false);
    });
  });

  describe('getPlatform()', () => {
    it('should return "web" for web environment', () => {
      cleanup();
      cleanup = mockWindow();
      expect(detector.getPlatform()).toBe('web');
    });

    it('should return "ios" when Capacitor reports iOS', () => {
      cleanup();
      cleanup = mockWindow({ getPlatform: () => 'ios' });
      expect(detector.getPlatform()).toBe('ios');
    });

    it('should return "android" when Capacitor reports android', () => {
      cleanup();
      cleanup = mockWindow({ getPlatform: () => 'android' });
      expect(detector.getPlatform()).toBe('android');
    });

    it('should fallback to user agent detection for iOS', () => {
      cleanup();
      cleanup = mockWindow(
        {}, // Capacitor present but no getPlatform
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      );
      expect(detector.getPlatform()).toBe('ios');
    });

    it('should fallback to user agent detection for iPad', () => {
      cleanup();
      cleanup = mockWindow(
        {},
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
      );
      expect(detector.getPlatform()).toBe('ios');
    });

    it('should fallback to android for other native environments', () => {
      cleanup();
      cleanup = mockWindow(
        {},
        'Mozilla/5.0 (Linux; Android 10; SM-G975F)'
      );
      expect(detector.getPlatform()).toBe('android');
    });

    it('should cache platform detection result', () => {
      cleanup();
      const mockCapacitor = { getPlatform: jest.fn(() => 'ios') };
      cleanup = mockWindow(mockCapacitor);
      
      detector.getPlatform();
      detector.getPlatform();
      
      expect(mockCapacitor.getPlatform).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCapabilities()', () => {
    describe('web capabilities', () => {
      beforeEach(() => {
        cleanup();
        cleanup = mockWindow();
      });

      it('should detect web capabilities correctly', () => {
        const capabilities = detector.getCapabilities();
        
        expect(capabilities.hasCamera).toBe(true); // navigator.mediaDevices present
        expect(capabilities.hasGeolocation).toBe(true); // navigator.geolocation present
        expect(capabilities.hasNotifications).toBe(true); // Notification in window
        expect(capabilities.hasStorage).toBe(true); // localStorage available
        expect(capabilities.hasBiometrics).toBe(false); // Not available in web
        expect(capabilities.hasAppState).toBe(false); // Not available in web
        expect(capabilities.hasBackgroundSync).toBe(true); // serviceWorker present
        expect(capabilities.hasNativeSharing).toBe(true); // navigator.share present
      });

      it('should handle missing web APIs gracefully', () => {
        cleanup();
        // @ts-ignore
        global.navigator = {
          userAgent: 'test',
        };
        // @ts-ignore
        global.window = {};
        detector.reset();

        const capabilities = detector.getCapabilities();
        
        expect(capabilities.hasCamera).toBe(false);
        expect(capabilities.hasGeolocation).toBe(false);
        expect(capabilities.hasNotifications).toBe(false);
        expect(capabilities.hasStorage).toBe(false);
        expect(capabilities.hasBackgroundSync).toBe(false);
        expect(capabilities.hasNativeSharing).toBe(false);
      });
    });

    describe('native capabilities', () => {
      beforeEach(() => {
        cleanup();
        cleanup = mockWindow({ getPlatform: () => 'ios' });
      });

      it('should assume all capabilities are available for native', () => {
        const capabilities = detector.getCapabilities();
        
        expect(capabilities.hasCamera).toBe(true);
        expect(capabilities.hasGeolocation).toBe(true);
        expect(capabilities.hasNotifications).toBe(true);
        expect(capabilities.hasStorage).toBe(true);
        expect(capabilities.hasBiometrics).toBe(true);
        expect(capabilities.hasAppState).toBe(true);
        expect(capabilities.hasBackgroundSync).toBe(true);
        expect(capabilities.hasNativeSharing).toBe(true);
      });
    });

    it('should cache capabilities result', () => {
      const capabilities1 = detector.getCapabilities();
      const capabilities2 = detector.getCapabilities();
      
      expect(capabilities1).toBe(capabilities2); // Same object reference
    });
  });

  describe('reset()', () => {
    it('should clear cached platform and capabilities', () => {
      // Get initial values to cache them
      detector.getPlatform();
      detector.getCapabilities();
      
      // Reset and change environment
      detector.reset();
      cleanup();
      cleanup = mockWindow({ getPlatform: () => 'android' });
      
      // Should detect new platform
      expect(detector.getPlatform()).toBe('android');
    });
  });
});