/**
 * Unit tests for conditional import system
 */

import {
  conditionalImport,
  createPlatformAdapter,
  conditionalImportWithFallback,
  createPlatformComponent,
  isPlatformModuleAvailable,
  batchConditionalImport,
  PlatformImportError,
} from '../conditional-imports';
import { platformDetector } from '../detector';

// Mock the platform detector
jest.mock('../detector', () => ({
  platformDetector: {
    isNative: jest.fn(),
    isWeb: jest.fn(),
  },
}));

const mockPlatformDetector = platformDetector as jest.Mocked<typeof platformDetector>;

describe('conditional-imports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('conditionalImport', () => {
    it('should import web module when on web platform', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const webModule = { name: 'web-module' };
      const nativeModule = { name: 'native-module' };
      
      const adapter = createPlatformAdapter(
        async () => webModule,
        async () => nativeModule
      );
      
      const result = await conditionalImport(adapter);
      expect(result).toBe(webModule);
    });

    it('should import native module when on native platform', async () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const webModule = { name: 'web-module' };
      const nativeModule = { name: 'native-module' };
      
      const adapter = createPlatformAdapter(
        async () => webModule,
        async () => nativeModule
      );
      
      const result = await conditionalImport(adapter);
      expect(result).toBe(nativeModule);
    });

    it('should throw PlatformImportError when web import fails', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const error = new Error('Import failed');
      const adapter = createPlatformAdapter(
        async () => { throw error; },
        async () => ({ name: 'native-module' })
      );
      
      await expect(conditionalImport(adapter)).rejects.toThrow(PlatformImportError);
      
      try {
        await conditionalImport(adapter);
      } catch (e) {
        expect(e).toBeInstanceOf(PlatformImportError);
        expect((e as PlatformImportError).platform).toBe('web');
        expect((e as PlatformImportError).originalError).toBe(error);
      }
    });

    it('should throw PlatformImportError when native import fails', async () => {
      mockPlatformDetector.isNative.mockReturnValue(true);
      
      const error = new Error('Import failed');
      const adapter = createPlatformAdapter(
        async () => ({ name: 'web-module' }),
        async () => { throw error; }
      );
      
      await expect(conditionalImport(adapter)).rejects.toThrow(PlatformImportError);
      
      try {
        await conditionalImport(adapter);
      } catch (e) {
        expect(e).toBeInstanceOf(PlatformImportError);
        expect((e as PlatformImportError).platform).toBe('native');
        expect((e as PlatformImportError).originalError).toBe(error);
      }
    });
  });

  describe('createPlatformAdapter', () => {
    it('should create adapter with web and native imports', () => {
      const webImport = async () => ({ name: 'web' });
      const nativeImport = async () => ({ name: 'native' });
      
      const adapter = createPlatformAdapter(webImport, nativeImport);
      
      expect(adapter.web).toBe(webImport);
      expect(adapter.native).toBe(nativeImport);
    });
  });

  describe('conditionalImportWithFallback', () => {
    it('should return platform-specific module when import succeeds', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const webModule = { name: 'web-module' };
      const fallbackModule = { name: 'fallback-module' };
      
      const adapter = createPlatformAdapter(
        async () => webModule,
        async () => ({ name: 'native-module' })
      );
      
      const result = await conditionalImportWithFallback(
        adapter,
        async () => fallbackModule
      );
      
      expect(result).toBe(webModule);
    });

    it('should return fallback when platform import fails', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const fallbackModule = { name: 'fallback-module' };
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const adapter = createPlatformAdapter(
        async () => { throw new Error('Import failed'); },
        async () => ({ name: 'native-module' })
      );
      
      const result = await conditionalImportWithFallback(
        adapter,
        async () => fallbackModule
      );
      
      expect(result).toBe(fallbackModule);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Platform-specific import failed, using fallback:',
        expect.any(PlatformImportError)
      );
      
      consoleSpy.mockRestore();
    });

    it('should throw error when no fallback is provided', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const adapter = createPlatformAdapter(
        async () => { throw new Error('Import failed'); },
        async () => ({ name: 'native-module' })
      );
      
      await expect(conditionalImportWithFallback(adapter)).rejects.toThrow(PlatformImportError);
    });
  });

  describe('createPlatformComponent', () => {
    it('should create component loader that imports correct platform component', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const WebComponent = () => 'Web Component';
      const NativeComponent = () => 'Native Component';
      
      const componentLoader = createPlatformComponent(
        async () => ({ default: WebComponent }),
        async () => ({ default: NativeComponent })
      );
      
      const result = await componentLoader();
      expect(result.default).toBe(WebComponent);
    });
  });

  describe('isPlatformModuleAvailable', () => {
    it('should return true when module import succeeds', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const adapter = createPlatformAdapter(
        async () => ({ name: 'web-module' }),
        async () => ({ name: 'native-module' })
      );
      
      const result = await isPlatformModuleAvailable(adapter);
      expect(result).toBe(true);
    });

    it('should return false when module import fails', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const adapter = createPlatformAdapter(
        async () => { throw new Error('Import failed'); },
        async () => ({ name: 'native-module' })
      );
      
      const result = await isPlatformModuleAvailable(adapter);
      expect(result).toBe(false);
    });
  });

  describe('batchConditionalImport', () => {
    it('should import multiple modules successfully', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const adapters = {
        storage: createPlatformAdapter(
          async () => ({ name: 'web-storage' }),
          async () => ({ name: 'native-storage' })
        ),
        http: createPlatformAdapter(
          async () => ({ name: 'web-http' }),
          async () => ({ name: 'native-http' })
        ),
      };
      
      const results = await batchConditionalImport(adapters);
      
      expect(results.storage).toEqual({ name: 'web-storage' });
      expect(results.http).toEqual({ name: 'web-http' });
    });

    it('should handle partial failures gracefully', async () => {
      mockPlatformDetector.isNative.mockReturnValue(false);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const adapters = {
        storage: createPlatformAdapter(
          async () => ({ name: 'web-storage' }),
          async () => ({ name: 'native-storage' })
        ),
        http: createPlatformAdapter(
          async () => { throw new Error('HTTP import failed'); },
          async () => ({ name: 'native-http' })
        ),
      };
      
      const results = await batchConditionalImport(adapters);
      
      expect(results.storage).toEqual({ name: 'web-storage' });
      expect(results.http).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to import http:',
        expect.any(PlatformImportError)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('PlatformImportError', () => {
    it('should create error with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new PlatformImportError('web', 'test-module', originalError);
      
      expect(error.name).toBe('PlatformImportError');
      expect(error.platform).toBe('web');
      expect(error.moduleName).toBe('test-module');
      expect(error.originalError).toBe(originalError);
      expect(error.message).toContain('Failed to import test-module for platform web');
      expect(error.message).toContain('Original error');
    });

    it('should handle missing original error', () => {
      const error = new PlatformImportError('native', 'test-module');
      
      expect(error.originalError).toBeUndefined();
      expect(error.message).toContain('Unknown error');
    });
  });
});