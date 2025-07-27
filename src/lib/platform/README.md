# Platform Detection and Conditional Import System

This module provides utilities for detecting the current platform (web vs native) and conditionally importing platform-specific modules for universal app deployment.

## Features

- **Platform Detection**: Automatically detects whether the app is running in a web browser or native Capacitor environment
- **Conditional Imports**: Dynamically imports platform-specific modules based on the current environment
- **Capability Detection**: Identifies available platform-specific capabilities
- **Graceful Fallbacks**: Provides fallback mechanisms when platform-specific features are unavailable
- **TypeScript Support**: Full TypeScript support with proper type definitions

## Usage

### Basic Platform Detection

```typescript
import { isNative, isWeb, getPlatform, getCapabilities } from '@/lib/platform';

// Check current platform
if (isNative()) {
  console.log('Running in native app');
} else {
  console.log('Running in web browser');
}

// Get specific platform
const platform = getPlatform(); // 'web' | 'ios' | 'android'

// Check capabilities
const capabilities = getCapabilities();
if (capabilities.hasCamera) {
  // Camera is available
}
```

### Conditional Imports

```typescript
import { createPlatformAdapter, conditionalImport } from '@/lib/platform';

// Create platform-specific adapter
const storageAdapter = createPlatformAdapter(
  // Web implementation
  async () => ({
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
  }),
  // Native implementation
  async () => {
    const { Preferences } = await import('@capacitor/preferences');
    return {
      get: async (key: string) => (await Preferences.get({ key })).value,
      set: async (key: string, value: string) => Preferences.set({ key, value }),
    };
  }
);

// Use the adapter
const storage = await conditionalImport(storageAdapter);
await storage.set('user-preference', 'dark-mode');
```

### With Fallbacks

```typescript
import { conditionalImportWithFallback } from '@/lib/platform';

const storage = await conditionalImportWithFallback(
  storageAdapter,
  // Fallback to in-memory storage
  async () => {
    const memoryStorage = new Map();
    return {
      get: (key: string) => memoryStorage.get(key),
      set: (key: string, value: string) => memoryStorage.set(key, value),
    };
  }
);
```

### Platform-Specific Components

```typescript
import { createPlatformComponent } from '@/lib/platform';

const MapComponent = createPlatformComponent(
  // Web component
  async () => import('./WebMapComponent'),
  // Native component
  async () => import('./NativeMapComponent')
);

// Use in React
const LazyMapComponent = React.lazy(MapComponent);
```

## API Reference

### Platform Detection

- `isNative(): boolean` - Returns true if running in Capacitor
- `isWeb(): boolean` - Returns true if running in web browser
- `getPlatform(): Platform` - Returns 'web', 'ios', or 'android'
- `getCapabilities(): PlatformCapabilities` - Returns available platform capabilities

### Conditional Imports

- `createPlatformAdapter<T>(webImport, nativeImport): PlatformAdapter<T>` - Creates platform adapter
- `conditionalImport<T>(adapter): Promise<T>` - Imports platform-specific module
- `conditionalImportWithFallback<T>(adapter, fallback): Promise<T>` - Imports with fallback
- `createPlatformComponent<T>(webComponent, nativeComponent)` - Creates platform-specific component loader
- `isPlatformModuleAvailable<T>(adapter): Promise<boolean>` - Checks if module is available
- `batchConditionalImport<T>(adapters): Promise<T>` - Imports multiple modules

### Types

```typescript
type Platform = 'web' | 'ios' | 'android';

interface PlatformCapabilities {
  hasCamera: boolean;
  hasGeolocation: boolean;
  hasNotifications: boolean;
  hasStorage: boolean;
  hasBiometrics: boolean;
  hasAppState: boolean;
  hasBackgroundSync: boolean;
  hasNativeSharing: boolean;
}

interface PlatformAdapter<T> {
  web: () => Promise<T>;
  native: () => Promise<T>;
}
```

## Implementation Details

### Platform Detection Logic

1. **Native Detection**: Checks for `window.Capacitor` object
2. **Platform Identification**: Uses `Capacitor.getPlatform()` when available
3. **Fallback Detection**: Uses user agent string for platform identification
4. **Capability Detection**: Checks for specific APIs and features

### Conditional Import Strategy

1. **Runtime Detection**: Determines platform at runtime
2. **Dynamic Imports**: Uses ES6 dynamic imports for code splitting
3. **Error Handling**: Provides detailed error information for failed imports
4. **Caching**: Caches platform detection results for performance

### Testing

The module includes comprehensive unit tests covering:
- Platform detection in various environments
- Conditional import functionality
- Error handling and fallbacks
- Capability detection
- Edge cases and error conditions

Run tests with:
```bash
npm test -- src/lib/platform
```

## Integration with Universal App

This platform detection system is designed to work with:
- **Next.js 14+** for web deployment
- **Capacitor 5+** for native mobile deployment
- **Existing codebase** with minimal changes required
- **Build system** that supports both web and native targets

The system enables a single codebase to deploy to web, iOS, and Android platforms while providing platform-specific optimizations and features.