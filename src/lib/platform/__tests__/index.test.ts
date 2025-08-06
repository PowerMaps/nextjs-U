/**
 * Tests for platform module exports
 */

import { 
  platformDetector,
  isNative,
  isWeb,
  getPlatform,
  getCapabilities
} from '../index';

// Mock platform detector
jest.mock('../detector', () => ({
  platformDetector: {
    isNative: jest.fn(),
    isWeb: jest.fn(),
    getPlatform: jest.fn(),
    getCapabilities: jest.fn()
  }
}));

const mockPlatformDetector = platformDetector as jest.Mocked<typeof platformDetector>;

describe('Platform Module Exports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convenience functions', () => {
    it('should export isNative function that calls platformDetector.isNative', () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const result = isNative();
      
      expect(result).toBe(true);
      expect(mockPlatformDetector.isNative).toHaveBeenCalled();
    });

    it('should export isWeb function that calls platformDetector.isWeb', () => {
      mockPlatformDetector.isWeb.mockReturnValue(true);
      
      const result = isWeb();
      
      expect(result).toBe(true);
      expect(mockPlatformDetector.isWeb).toHaveBeenCalled();
    });

    it('should export getPlatform function that calls platformDetector.getPlatform', () => {
      mockPlatformDetector.getPlatform.mockReturnValue('android');
      
      const result = getPlatform();
      
      expect(result).toBe('android');
      expect(mockPlatformDetector.getPlatform).toHaveBeenCalled();
    });

    it('should export getCapabilities function that calls platformDetector.getCapabilities', () => {
      const mockCapabilities = {
        hasCamera: true,
        hasGeolocation: true,
        hasNotifications: true,
        hasStorage: true,
        hasBiometrics: true,
        hasAppState: true,
        hasNetwork: true,
        hasDevice: true
      };
      
      mockPlatformDetector.getCapabilities.mockReturnValue(mockCapabilities);
      
      const result = getCapabilities();
      
      expect(result).toEqual(mockCapabilities);
      expect(mockPlatformDetector.getCapabilities).toHaveBeenCalled();
    });
  });
});