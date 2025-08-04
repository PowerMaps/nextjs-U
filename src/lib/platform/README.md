# Platform Detection and Conditional Imports

This module provides platform detection and conditional import capabilities for universal app deployment across web, iOS, and Android platforms using Capacitor.

## Features

- **Platform Detection**: Detect whether the app is running on web, iOS, or Android
- **Conditional Imports**: Dynamically import platform-specific modules
- **Platform Adapters**: Create adapters that automatically load the correct implementation
- **Capability Detection**: Check what features are available on the current platform
- **Configuration Management**: Get platform-specific configurations

## Quick Start

```typescript
import { isNative, getPlatform, getCapabilities } from '@/lib/platform';

// Check platform
if (isNative()) {
  console.log('Running on mobile:', getPlatform());
} else {
  console.log('Running on web');
}

// Check capabilities
const capabilities = getCapabilities();
if (capabilities.hasCamera) {
  // Camera is available
}
```

## Platform Detection

### Basic Detection

```typescript
import { platformDetector, isNative, isWeb, getPlatform } from '@/lib/platform';

// Check if running in native app
const native = isNative(); // boolean

// Check if running in web browser
const web = isWeb(); // boolean

// Get specific platform
const platform = getPlatform(); // 'web' | 'ios' | 'android'
```

### Capability Detection

```typescript
import { getCapabilities } from '@/lib/platform';

const capabilities = getCapabilities();
// {
//   hasCamera: boolean;
//   hasGeolocation: boolean;
//   hasNotifications: boolean;
//   hasStorage: boolean;
//   hasBiometrics: boolean;
//   hasAppState: boolean;
//   hasNetwork: boolean;
//   hasDevice: boolean;
// }
```

## Conditional Imports

### Creating Platform Adapters

```typescript
import { createPlatformAdapter, importPlatformModule } from '@/lib/platform';

// Define interface
interface StorageService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

// Create adapter
const storageAdapter = createPlatformAdapter<StorageService>(
  // Web implementation
  async () => {
    const { WebStorage } = await import('./web-storage');
    return new WebStorage();
  },
  // Native implementation
  async () => {
    const { NativeStorage } = await import('./native-storage');
    return new NativeStorage();
  }
);

// Use adapter
const storage = await importPlatformModule(storageAdapter);
await storage.set('key', 'value');
```

### Platform-Specific Execution

```typescript
import { executePlatformSpecific } from '@/lib/platform';

const result = executePlatformSpecific(
  // Web function
  () => localStorage.getItem('key'),
  // Native function
  () => nativeStorage.get('key')
);
```

## Configuration Management

### Platform-Specific Config

```typescript
import { getPlatformConfig } from '@/lib/platform';

const config = getPlatformConfig({
  web: {
    apiUrl: 'https://web-api.example.com',
    timeout: 5000
  },
  native: {
    apiUrl: 'https://mobile-api.example.com',
    timeout: 10000
  },
  android: {
    apiUrl: 'https://android-api.example.com',
    timeout: 8000
  },
  ios: {
    apiUrl: 'https://ios-api.example.com',
    timeout: 8000
  }
});
```

## Common Use Cases

### 1. Storage Abstraction

```typescript
// Create storage service that works on all platforms
const storageService = await importPlatformModule(
  createPlatformAdapter(
    () => import('./web-storage'),
    () => import('./capacitor-storage')
  )
);
```

### 2. HTTP Client Selection

```typescript
// Use appropriate HTTP client for platform
const httpClient = await importPlatformModule(
  createPlatformAdapter(
    () => import('./axios-client'),
    () => import('./capacitor-http-client')
  )
);
```

### 3. Notification Service

```typescript
// Platform-specific notifications
const notificationService = await importPlatformModule(
  createPlatformAdapter(
    () => import('./web-notifications'),
    () => import('./capacitor-notifications')
  )
);
```

### 4. Camera Access

```typescript
// Only available on native platforms
const capabilities = getCapabilities();
if (capabilities.hasCamera) {
  const camera = await importPlatformModule(cameraAdapter);
  const photo = await camera.takePicture();
}
```

## Testing

The platform detection system includes comprehensive test utilities:

```typescript
import { UniversalPlatformDetector } from '@/lib/platform';

// Create detector instance for testing
const detector = new UniversalPlatformDetector();

// Reset cached values between tests
detector.reset();
```

## Build Integration

This system works with your existing build configuration:

- **Web builds**: Uses standard Next.js build process
- **Native builds**: Uses Capacitor static export with platform detection
- **Development**: Works in both web dev server and native development

## Error Handling

The system includes automatic fallbacks:

- If native module import fails, falls back to web implementation
- Graceful degradation when platform features are unavailable
- Console warnings for debugging import issues

## Performance

- Platform detection results are cached
- Conditional imports use dynamic imports for code splitting
- Only loads platform-specific code when needed
- Minimal overhead for platform detection

## TypeScript Support

Full TypeScript support with:

- Strict typing for platform detection
- Generic types for platform adapters
- Interface definitions for all capabilities
- Type-safe configuration objects