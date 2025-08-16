/**
 * Web storage adapter using localStorage/sessionStorage
 */

import { StorageAdapter, PlatformCapabilities } from '../../types';
import { AbstractBaseAdapter, PlatformError } from '../../base-adapter';

export class WebStorageAdapter extends AbstractBaseAdapter implements StorageAdapter {
  private storage: Storage;

  constructor(useSessionStorage = false) {
    super();
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }

  async initialize(): Promise<void> {
    try {
      // Test storage availability
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      
      this.setAvailable(true);
      this.setInitialized(true);
    } catch (error) {
      console.warn('Web storage not available:', error);
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
        'Storage not available',
        'web',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      return this.storage.getItem(key);
    } catch (error) {
      throw new PlatformError(
        `Failed to get item: ${key}`,
        'web',
        'STORAGE_GET_ERROR',
        true
      );
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Storage not available',
        'web',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      this.storage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new PlatformError(
          'Storage quota exceeded',
          'web',
          'STORAGE_QUOTA_EXCEEDED',
          true,
          () => this.clearOldItems()
        );
      }
      throw new PlatformError(
        `Failed to set item: ${key}`,
        'web',
        'STORAGE_SET_ERROR',
        true
      );
    }
  }

  async remove(key: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Storage not available',
        'web',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      this.storage.removeItem(key);
    } catch (error) {
      throw new PlatformError(
        `Failed to remove item: ${key}`,
        'web',
        'STORAGE_REMOVE_ERROR',
        true
      );
    }
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Storage not available',
        'web',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      this.storage.clear();
    } catch (error) {
      throw new PlatformError(
        'Failed to clear storage',
        'web',
        'STORAGE_CLEAR_ERROR',
        true
      );
    }
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized();
    
    if (!this.isAvailable()) {
      throw new PlatformError(
        'Storage not available',
        'web',
        'STORAGE_UNAVAILABLE',
        false
      );
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      throw new PlatformError(
        'Failed to get storage keys',
        'web',
        'STORAGE_KEYS_ERROR',
        true
      );
    }
  }

  private clearOldItems(): void {
    // Simple cleanup strategy - remove items that look like they might be old
    // This is a basic implementation; you might want to implement a more sophisticated strategy
    try {
      const keys = Object.keys(this.storage);
      const itemsToRemove = keys.slice(0, Math.floor(keys.length * 0.1)); // Remove 10% of items
      itemsToRemove.forEach(key => this.storage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear old items:', error);
    }
  }
}