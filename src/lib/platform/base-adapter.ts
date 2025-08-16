/**
 * Base adapter implementation for platform-specific functionality
 */

import { BaseAdapter, PlatformCapabilities } from './types';

export abstract class AbstractBaseAdapter implements BaseAdapter {
  protected _initialized = false;
  protected _available = false;

  abstract initialize(): Promise<void>;

  isAvailable(): boolean {
    return this._available;
  }

  abstract getCapabilities(): Partial<PlatformCapabilities>;

  protected setAvailable(available: boolean): void {
    this._available = available;
  }

  protected setInitialized(initialized: boolean): void {
    this._initialized = initialized;
  }

  protected isInitialized(): boolean {
    return this._initialized;
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this._initialized) {
      await this.initialize();
    }
  }
}

/**
 * Error class for platform-specific errors
 */
export class PlatformError extends Error {
  constructor(
    message: string,
    public platform: string,
    public code: string,
    public recoverable: boolean = true,
    public fallbackAction?: () => void
  ) {
    super(message);
    this.name = 'PlatformError';
  }
}

/**
 * Utility function to handle platform-specific operations with fallbacks
 */
export async function withFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  errorMessage: string = 'Platform operation failed'
): Promise<T> {
  try {
    return await primaryOperation();
  } catch (error) {
    console.warn(`${errorMessage}, falling back:`, error);
    return await fallbackOperation();
  }
}

/**
 * Retry mechanism for platform-specific operations
 */
export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  fallbackToWeb?: boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  fallback?: () => Promise<T>
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxAttempts) {
        break;
      }

      const delay = config.backoffStrategy === 'exponential' 
        ? config.baseDelay * Math.pow(2, attempt - 1)
        : config.baseDelay * attempt;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we have a fallback and it's configured to use it
  if (fallback && config.fallbackToWeb) {
    console.warn('All retry attempts failed, using fallback:', lastError);
    return await fallback();
  }

  throw lastError || new Error('Operation failed with no error details');
}