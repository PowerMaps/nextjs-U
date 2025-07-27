/**
 * Integration tests for platform detection and conditional import system
 */

import { PlatformDetectorImpl } from '../detector';
import { createPlatformAdapter, conditionalImport } from '../conditional-imports';

// Mock window for integration testing
const mockWebEnvironment = () => {
  // @ts-ignore
  global.window = {
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      mediaDevices: { getUserMedia: jest.fn() },
      geolocation: { getCurrentPosition: jest.fn() },
    },
  };
  // @ts-ignore
  global.navigator = global.window.navigator;
};

const mockNativeEnvironment = () => {
  // @ts-ignore
  global.window = {
    Capacitor: {
      getPlatform: () => 'ios',
    },
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
    },
  };
  // @ts-ignore
  global.navigator = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  };
};

describe('Platform System Integration', () => {
  let detector: PlatformDetectorImpl;

  beforeEach(() => {
    detector = new PlatformDetectorImpl();
  });

  afterEach(() => {
    detector.reset();
  });

  describe('Web Environment Integration', () => {
    beforeEach(() => {
      mockWebEnvironment();
      detector.reset();
    });

    it('should detect web environment and import web modules', async () => {
      expect(detector.isWeb()).toBe(true);
      expect(detector.getPlatform()).toBe('web');

      const adapter = createPlatformAdapter(
        async () => ({ type: 'web-storage' }),
        async () => ({ type: 'native-storage' })
      );

      const result = await conditionalImport(adapter);
      expect(result.type).toBe('web-storage');
    });

    it('should detect web capabilities correctly', () => {
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasCamera).toBe(true);
      expect(capabilities.hasGeolocation).toBe(true);
      expect(capabilities.hasBiometrics).toBe(false); // Not available in web
      expect(capabilities.hasAppState).toBe(false); // Not available in web
    });
  });

  describe('Native Environment Integration', () => {
    beforeEach(() => {
      mockNativeEnvironment();
      detector.reset();
    });

    it('should detect native environment and import native modules', async () => {
      expect(detector.isNative()).toBe(true);
      expect(detector.getPlatform()).toBe('ios');

      const adapter = createPlatformAdapter(
        async () => ({ type: 'web-storage' }),
        async () => ({ type: 'native-storage' })
      );

      const result = await conditionalImport(adapter);
      expect(result.type).toBe('native-storage');
    });

    it('should assume all capabilities are available for native', () => {
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasCamera).toBe(true);
      expect(capabilities.hasGeolocation).toBe(true);
      expect(capabilities.hasBiometrics).toBe(true);
      expect(capabilities.hasAppState).toBe(true);
      expect(capabilities.hasBackgroundSync).toBe(true);
      expect(capabilities.hasNativeSharing).toBe(true);
    });
  });

  describe('Platform Switching', () => {
    it('should correctly switch between platforms when environment changes', async () => {
      // Start with web
      mockWebEnvironment();
      detector.reset();
      
      expect(detector.getPlatform()).toBe('web');
      
      const adapter = createPlatformAdapter(
        async () => ({ platform: 'web' }),
        async () => ({ platform: 'native' })
      );
      
      let result = await conditionalImport(adapter);
      expect(result.platform).toBe('web');
      
      // Switch to native
      mockNativeEnvironment();
      detector.reset();
      
      expect(detector.getPlatform()).toBe('ios');
      
      result = await conditionalImport(adapter);
      expect(result.platform).toBe('native');
    });
  });
});