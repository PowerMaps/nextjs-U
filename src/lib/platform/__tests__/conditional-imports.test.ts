/**
 * Tests for conditional import system
 */

import { platformDetector } from '../detector';
import { 
  importPlatformModule, 
  createPlatformAdapter, 
  executePlatformSpecific,
  getPlatformConfig 
} from '../conditional-imports';

// Mock platform detector
jest.mock('../detector', () => ({
  platformDetector: {
    isNative: jest.fn(),
    isWeb: jest.fn(),
    getPlatform: jest.fn()
  }
}));

const mockPlatformDetector = platformDetector as jest.Mocked<typeof platformDetector>;

describe('Conditional Imports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importPlatformModule', () => {
    it('should import native module when on native platform', async () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const webModule = { type: 'web' };
      const nativeModule = { type: 'native' };
      
      const adapter = createPlatformAdapter(
        async () => webModule,
        async () => nativeModule
      );
      
      const result = await importPlatformModule(adapter);
      
      expect(result).toEqual(nativeModule);
    });

    it('should import web module when on web platform', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const webModule = { type: 'web' };
      const nativeModule = { type: 'native' };
      
      const adapter = createPlatformAdapter(
        async () => webModule,
        async () => nativeModule
      );
      
      const result = await importPlatformModule(adapter);
      
      expect(result).toEqual(webModule);
    });

    it('should fallback to web module if native import fails', async () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const webModule = { type: 'web' };
      const adapter = createPlatformAdapter(
        async () => webModule,
        async () => { throw new Error('Native import failed'); }
      );
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = await importPlatformModule(adapter);
      
      expect(result).toEqual(webModule);
      expect(consoleSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('Falling back to web implementation');
      
      consoleSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('executePlatformSpecific', () => {
    it('should execute native function when on native platform', () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const webFn = jest.fn(() => 'web');
      const nativeFn = jest.fn(() => 'native');
      
      const result = executePlatformSpecific(webFn, nativeFn);
      
      expect(result).toBe('native');
      expect(nativeFn).toHaveBeenCalled();
      expect(webFn).not.toHaveBeenCalled();
    });

    it('should execute web function when on web platform', () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const webFn = jest.fn(() => 'web');
      const nativeFn = jest.fn(() => 'native');
      
      const result = executePlatformSpecific(webFn, nativeFn);
      
      expect(result).toBe('web');
      expect(webFn).toHaveBeenCalled();
      expect(nativeFn).not.toHaveBeenCalled();
    });
  });

  describe('getPlatformConfig', () => {
    it('should return Android-specific config when on Android', () => {
      mockPlatformDetector.getPlatform.mockReturnValue('android');
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const config = {
        web: { api: 'web-api' },
        native: { api: 'native-api' },
        android: { api: 'android-api' }
      };
      
      const result = getPlatformConfig(config);
      
      expect(result).toEqual({ api: 'android-api' });
    });

    it('should return iOS-specific config when on iOS', () => {
      mockPlatformDetector.getPlatform.mockReturnValue('ios');
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const config = {
        web: { api: 'web-api' },
        native: { api: 'native-api' },
        ios: { api: 'ios-api' }
      };
      
      const result = getPlatformConfig(config);
      
      expect(result).toEqual({ api: 'ios-api' });
    });

    it('should return native config when no platform-specific config exists', () => {
      mockPlatformDetector.getPlatform.mockReturnValue('android');
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const config = {
        web: { api: 'web-api' },
        native: { api: 'native-api' }
      };
      
      const result = getPlatformConfig(config);
      
      expect(result).toEqual({ api: 'native-api' });
    });

    it('should return web config when on web platform', () => {
      mockPlatformDetector.getPlatform.mockReturnValue('web');
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const config = {
        web: { api: 'web-api' },
        native: { api: 'native-api' }
      };
      
      const result = getPlatformConfig(config);
      
      expect(result).toEqual({ api: 'web-api' });
    });
  });
});