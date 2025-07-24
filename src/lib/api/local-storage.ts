'use client';

// Generic local storage utility
class LocalStorageManager {
  // Set an item in local storage
  public setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item in local storage: ${key}`, error);
    }
  }

  // Get an item from local storage
  public getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting item from local storage: ${key}`, error);
      return null;
    }
  }

  // Remove an item from local storage
  public removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from local storage: ${key}`, error);
    }
  }

  // Clear all items from local storage
  public clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing local storage', error);
    }
  }
}

// Create a singleton instance
export const localStorageManager = new LocalStorageManager();

// Keys for local storage
export const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  VEHICLE_LIST: 'vehicle_list',
  TRIP_HISTORY: 'trip_history',
  SAVED_ROUTES: 'saved_routes',
  APP_SETTINGS: 'app_settings',
};
