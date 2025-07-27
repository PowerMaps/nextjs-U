/**
 * Conditional import system for platform-specific modules
 */

import { platformDetector } from './detector';
import type { PlatformAdapter } from './types';

/**
 * Error thrown when a platform-specific module fails to load
 */
export class PlatformImportError extends Error {
  constructor(
    public platform: string,
    public moduleName: string,
    public originalError?: Error
  ) {
    super(`Failed to import ${moduleName} for platform ${platform}: ${originalError?.message || 'Unknown error'}`);
    this.name = 'PlatformImportError';
  }
}

/**
 * Conditionally imports a module based on the current platform
 */
export async function conditionalImport<T>(adapter: PlatformAdapter<T>): Promise<T> {
  const isNative = platformDetector.isNative();
  
  try {
    if (isNative) {
      return await adapter.native();
    } else {
      return await adapter.web();
    }
  } catch (error) {
    const platform = isNative ? 'native' : 'web';
    throw new PlatformImportError(
      platform,
      'unknown',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Creates a platform adapter with web and native implementations
 */
export function createPlatformAdapter<T>(
  webImport: () => Promise<T>,
  nativeImport: () => Promise<T>
): PlatformAdapter<T> {
  return {
    web: webImport,
    native: nativeImport,
  };
}

/**
 * Conditionally imports a module with fallback support
 */
export async function conditionalImportWithFallback<T>(
  adapter: PlatformAdapter<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  try {
    return await conditionalImport(adapter);
  } catch (error) {
    if (fallback) {
      console.warn('Platform-specific import failed, using fallback:', error);
      return await fallback();
    }
    throw error;
  }
}

/**
 * Lazy loading wrapper for platform-specific components
 */
export function createPlatformComponent<T>(
  webComponent: () => Promise<{ default: T }>,
  nativeComponent: () => Promise<{ default: T }>
): () => Promise<{ default: T }> {
  return async () => {
    const adapter = createPlatformAdapter(webComponent, nativeComponent);
    return await conditionalImport(adapter);
  };
}

/**
 * Utility to check if a platform-specific module is available
 */
export async function isPlatformModuleAvailable<T>(
  adapter: PlatformAdapter<T>
): Promise<boolean> {
  try {
    await conditionalImport(adapter);
    return true;
  } catch {
    return false;
  }
}

/**
 * Batch import multiple platform-specific modules
 */
export async function batchConditionalImport<T extends Record<string, PlatformAdapter<any>>>(
  adapters: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<typeof conditionalImport<any>>> }> {
  const results = {} as any;
  
  await Promise.all(
    Object.entries(adapters).map(async ([key, adapter]) => {
      try {
        results[key] = await conditionalImport(adapter);
      } catch (error) {
        console.error(`Failed to import ${key}:`, error);
        results[key] = null;
      }
    })
  );
  
  return results;
}