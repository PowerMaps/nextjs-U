/**
 * Native storage adapter using Capacitor Preferences
 */

import { Preferences } from '@capacitor/preferences';
import { StorageAdapter, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class NativeStorageAdapter extends AbstractBaseAdapter implements StorageAdapter {
  async initialize(): Promise<void> {
    try {
      // Test Preferences availability
      await Preferences.keys();
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Native storage not available:', error);
      this.setAvailable(false);
      this.setInitialized(true);
    }
  }

  getCapabilities(): Partial<PlatformCapabilities> {
    return {
      hasStorage: this.isAvailable(),
    };
  }

  async get(key: string): Promise<string | null> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native storage not available',
        'native',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      throw new PlatformError(
        `Failed to get item: ${key}`,
        'native',
        'STORAGE_GET_ERROR',
        true
      );
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native storage not available',
        'native',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      await Preferences.set({ key, value });
    } catch (error) {
      throw new PlatformError(
        `Failed to set item: ${key}`,
        'native',
        'STORAGE_SET_ERROR',
        true
      );
    }
  }

  async remove(key: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native storage not available',
        'native',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      await Preferences.remove({ key });
    } catch (error) {
      throw new PlatformError(
        `Failed to remove item: ${key}`,
        'native',
        'STORAGE_REMOVE_ERROR',
        true
      );
    }
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native storage not available',
        'native',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      await Preferences.clear();
    } catch (error) {
      throw new PlatformError(
        'Failed to clear storage',
        'native',
        'STORAGE_CLEAR_ERROR',
        true
      );
    }
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Native storage not available',
        'native',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      const result = await Preferences.keys();
      return result.keys;
    } catch (error) {
      throw new PlatformError(
        'Failed to get storage keys',
        'native',
        'STORAGE_KEYS_ERROR',
        true
      );
    }
  }
}