/**
 * Tests for platform detection utilities
 */

import { Capacitor } from '@capacitor/core';
import { UniversalPlatformDetector } from '../detector';

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(),
    getPlatform: jest.fn()
  }
}));

const mockCapacitor = Capacitor as jest.Mocked<typeof Capacitor>;

describe('UniversalPlatformDetector', () => {
  let detector: UniversalPlatformDetector;

  beforeEach(() => {
    detector = new UniversalPlatformDetector();
    detector.reset();
    jest.clearAllMocks();
  });

  describe('isNative', () => {
    it('should return true when running in native environment', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      
      expect(detector.isNative()).toBe(true);
    });

    it('should return false when running in web environment', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      expect(detector.isNative()).toBe(false);
    });
  });

  describe('isWeb', () => {
    it('should return false when running in native environment', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      
      expect(detector.isWeb()).toBe(false);
    });

    it('should return true when running in web environment', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      expect(detector.isWeb()).toBe(true);
    });
  });

  describe('getPlatform', () => {
    it('should return "android" when running on Android', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('android');
      
      expect(detector.getPlatform()).toBe('android');
    });

    it('should return "ios" when running on iOS', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('ios');
      
      expect(detector.getPlatform()).toBe('ios');
    });

    it('should return "web" when running in browser', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      expect(detector.getPlatform()).toBe('web');
    });

    it('should cache platform result', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('android');
      
      detector.getPlatform();
      detector.getPlatform();
      
      expect(mockCapacitor.getPlatform).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCapabilities', () => {
    it('should return native capabilities for native platforms', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('android');
      
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasCamera).toBe(true);
      expect(capabilities.hasBiometrics).toBe(true);
      expect(capabilities.hasAppState).toBe(true);
      expect(capabilities.hasDevice).toBe(true);
    });

    it('should return web capabilities for web platform', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasCamera).toBe(false);
      expect(capabilities.hasBiometrics).toBe(false);
      expect(capabilities.hasAppState).toBe(false);
      expect(capabilities.hasDevice).toBe(false);
    });

    it('should return common capabilities for all platforms', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      const capabilities = detector.getCapabilities();
      
      expect(capabilities.hasGeolocation).toBe(true);
      expect(capabilities.hasStorage).toBe(true);
      expect(capabilities.hasNetwork).toBe(true);
    });

    it('should cache capabilities result', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('android');
      
      const capabilities1 = detector.getCapabilities();
      const capabilities2 = detector.getCapabilities();
      
      expect(capabilities1).toEqual(capabilities2);
      expect(capabilities1).toBe(capabilities2); // Same reference
    });
  });

  describe('reset', () => {
    it('should clear cached values', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('android');
      
      detector.getPlatform();
      detector.reset();
      detector.getPlatform();
      
      expect(mockCapacitor.getPlatform).toHaveBeenCalledTimes(2);
    });
  });
});