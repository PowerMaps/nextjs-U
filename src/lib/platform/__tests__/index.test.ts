/**
 * Unit tests for platform module exports
 */

import * as platformModule from '../index';
import { platformDetector } from '../detector';

// Mock the platform detector
jest.mock('../detector', () => ({
  platformDetector: {
    isNative: jest.fn(),
    isWeb: jest.fn(),
    getPlatform: jest.fn(),
    getCapabilities: jest.fn(),
  },
}));

const mockPlatformDetector = platformDetector as jest.Mocked<typeof platformDetector>;

describe('platform module exports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convenience exports', () => {
    it('should export isNative function that calls platformDetector.isNative', () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const result = platformModule.isNative();
      
      expect(result).toBe(true);
      expect(mockPlatformDetector.isNative).toHaveBeenCalledTimes(1);
    });

    it('should export isWeb function that calls platformDetector.isWeb', () => {
      mockPlatformDetector.isWeb.mockReturnValue(true);
      
      const result = platformModule.isWeb();
      
      expect(result).toBe(true);
      expect(mockPlatformDetector.isWeb).toHaveBeenCalledTimes(1);
    });

    it('should export getPlatform function that calls platformDetector.getPlatform', () => {
      mockPlatformDetector.getPlatform.mockReturnValue('ios');
      
      const result = platformModule.getPlatform();
      
      expect(result).toBe('ios');
      expect(mockPlatformDetector.getPlatform).toHaveBeenCalledTimes(1);
    });

    it('should export getCapabilities function that calls platformDetector.getCapabilities', () => {
      const mockCapabilities = {
        hasCamera: true,
        hasGeolocation: true,
        hasNotifications: true,
        hasStorage: true,
        hasBiometrics: false,
        hasAppState: false,
        hasBackgroundSync: true,
        hasNativeSharing: true,
      };
      
      mockPlatformDetector.getCapabilities.mockReturnValue(mockCapabilities);
      
      const result = platformModule.getCapabilities();
      
      expect(result).toBe(mockCapabilities);
      expect(mockPlatformDetector.getCapabilities).toHaveBeenCalledTimes(1);
    });
  });

  describe('module exports', () => {
    it('should export all required types', () => {
      // These are type-only exports, so we just check they exist in the module
      expect(typeof platformModule.platformDetector).toBeDefined();
      expect(typeof platformModule.PlatformDetectorImpl).toBeDefined();
      expect(typeof platformModule.conditionalImport).toBeDefined();
      expect(typeof platformModule.createPlatformAdapter).toBeDefined();
      expect(typeof platformModule.conditionalImportWithFallback).toBeDefined();
      expect(typeof platformModule.createPlatformComponent).toBeDefined();
      expect(typeof platformModule.isPlatformModuleAvailable).toBeDefined();
      expect(typeof platformModule.batchConditionalImport).toBeDefined();
      expect(typeof platformModule.PlatformImportError).toBeDefined();
    });

    it('should export platformDetector instance', () => {
      expect(platformModule.platformDetector).toBe(mockPlatformDetector);
    });

    it('should export PlatformDetectorImpl class', () => {
      expect(typeof platformModule.PlatformDetectorImpl).toBe('function');
      expect(platformModule.PlatformDetectorImpl.name).toBe('PlatformDetectorImpl');
    });

    it('should export conditional import functions', () => {
      expect(typeof platformModule.conditionalImport).toBe('function');
      expect(typeof platformModule.createPlatformAdapter).toBe('function');
      expect(typeof platformModule.conditionalImportWithFallback).toBe('function');
      expect(typeof platformModule.createPlatformComponent).toBe('function');
      expect(typeof platformModule.isPlatformModuleAvailable).toBe('function');
      expect(typeof platformModule.batchConditionalImport).toBe('function');
    });

    it('should export PlatformImportError class', () => {
      expect(typeof platformModule.PlatformImportError).toBe('function');
      expect(platformModule.PlatformImportError.name).toBe('PlatformImportError');
    });
  });
});