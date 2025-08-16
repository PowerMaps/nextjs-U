/**
 * Tests for platform detection utilities
 */

import { UniversalPlatformDetector } from '../detector';

// Mock window and navigator for testing
const mockWindow = (capacitor?: any, userAgent?: string) => {
  Object.defineProperty(global, 'window', {
    value: {
      Capacitor: capacitor,
    },
    writable: true,
  });

  Object.defineProperty(global, 'navigator', {
    value: {
      userAgent: userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      mediaDevices: {
        getUserMedia: jest.fn(),
      },
      geolocation: {},
    },
    writable: true,
  });

  Object.defineProperty(global, 'document', {
    value: {
      visibilityState: 'visible',
    },
    writable: true,
  });

  Object.defineProperty(global, 'Notification', {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(global, 'File', {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(global, 'FileReader', {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(global, 'FileList', {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(global, 'Blob', {
    value: jest.fn(),
    writable: true,
  });
};

describe('UniversalPlatformDetector', () => {
  let detector: UniversalPlatformDetector;

  beforeEach(() => {
    detector = new UniversalPlatformDetector();
    detector.reset();
  });

  afterEach(() => {
    detector.reset();
  });

  describe('Web Platform Detection', () => {
    beforeEach(() => {
      mockWindow();
    });

    it('should detect web platform correctly', () => {
      expect(detector.isWeb()).toBe(true);
      expect(detector.isNative()).toBe(false);
      expect(detector.getPlatform()).toBe('web');
    });

    it('should detect web capabilities correctly', () => {
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasCamera).toBe(true);
      expect(capabilities.hasGeolocation).toBe(true);
      expect(capabilities.hasNotifications).toBe(true);
      expect(capabilities.hasStorage).toBe(true);
      expect(capabilities.hasBiometrics).toBe(false);
      expect(capabilities.hasAppState).toBe(true);
      expect(capabilities.hasNetwork).toBe(true);
      expect(capabilities.hasFileSystem).toBe(true);
    });
  });

  describe('Native Platform Detection', () => {
    beforeEach(() => {
      mockWindow({
        getPlatform: () => 'ios',
      });
    });

    it('should detect native platform correctly', () => {
      expect(detector.isNative()).toBe(true);
      expect(detector.isWeb()).toBe(false);
      expect(detector.getPlatform()).toBe('ios');
    });

    it('should detect native capabilities correctly', () => {
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasCamera).toBe(true);
      expect(capabilities.hasGeolocation).toBe(true);
      expect(capabilities.hasNotifications).toBe(true);
      expect(capabilities.hasStorage).toBe(true);
      expect(capabilities.hasBiometrics).toBe(true);
      expect(capabilities.hasAppState).toBe(true);
      expect(capabilities.hasNetwork).toBe(true);
      expect(capabilities.hasFileSystem).toBe(true);
    });
  });

  describe('Android Platform Detection', () => {
    beforeEach(() => {
      mockWindow({
        getPlatform: () => 'android',
      });
    });

    it('should detect Android platform correctly', () => {
      expect(detector.isNative()).toBe(true);
      expect(detector.getPlatform()).toBe('android');
    });
  });

  describe('Fallback Detection', () => {
    beforeEach(() => {
      mockWindow({}, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
    });

    it('should fallback to user agent detection when Capacitor is not available', () => {
      // Remove Capacitor.getPlatform to test fallback
      mockWindow({});
      
      const detector = new UniversalPlatformDetector();
      expect(detector.getPlatform()).toBe('web');
    });
  });

  describe('Server-side Rendering', () => {
    beforeEach(() => {
      // Mock server environment (no window)
      delete (global as any).window;
    });

    it('should handle server-side rendering correctly', () => {
      expect(detector.isWeb()).toBe(true);
      expect(detector.isNative()).toBe(false);
      expect(detector.getPlatform()).toBe('web');
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      mockWindow();
    });

    it('should cache platform detection results', () => {
      const platform1 = detector.getPlatform();
      const platform2 = detector.getPlatform();
      
      expect(platform1).toBe(platform2);
      expect(platform1).toBe('web');
    });

    it('should cache capabilities results', () => {
      const capabilities1 = detector.getCapabilities();
      const capabilities2 = detector.getCapabilities();
      
      expect(capabilities1).toBe(capabilities2);
    });

    it('should reset cache when reset() is called', () => {
      const platform1 = detector.getPlatform();
      detector.reset();
      
      // Mock different environment
      mockWindow({
        getPlatform: () => 'ios',
      });
      
      const platform2 = detector.getPlatform();
      expect(platform1).not.toBe(platform2);
      expect(platform2).toBe('ios');
    });
  });
});