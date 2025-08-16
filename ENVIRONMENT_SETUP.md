# Environment-Specific Build System

This document explains how to use the environment-specific build system for iOS and Android with different configurations.

## 🚀 Quick Start

### Development Builds
```bash
# Android Development
npm run run:android:dev

# iOS Development  
npm run run:ios:dev
```

### Production Builds
```bash
# Android Production
npm run run:android:prod

# iOS Production
npm run run:ios:prod
```

### Staging Builds
```bash
# Android Staging
npm run run:android:staging

# iOS Staging
npm run run:ios:staging
```

## 📁 Environment Files

The project now supports multiple environment configurations:

- **`.env.local`** - Web development (localhost)
- **`.env.development`** - Mobile development builds
- **`.env.staging`** - Staging/testing builds
- **`.env.production`** - Web production
- **`.env.production.mobile`** - Mobile production builds

## 🛠 Available Scripts

### Build Scripts (No Run)
```bash
# Build only (no device deployment)
npm run build:android:dev      # Android development build
npm run build:android:staging  # Android staging build  
npm run build:android:prod     # Android production build

npm run build:ios:dev          # iOS development build
npm run build:ios:staging      # iOS staging build
npm run build:ios:prod         # iOS production build
```

### Build + Run Scripts
```bash
# Build and deploy to device/emulator
npm run run:android:dev        # Build + run Android dev
npm run run:android:staging    # Build + run Android staging
npm run run:android:prod       # Build + run Android prod

npm run run:ios:dev            # Build + run iOS dev
npm run run:ios:staging        # Build + run iOS staging  
npm run run:ios:prod           # Build + run iOS prod
```

### IDE Scripts
```bash
# Open in native IDEs
npm run open:android           # Open in Android Studio
npm run open:ios               # Open in Xcode
```

### Manual Build Scripts
```bash
# Manual Gradle builds
npm run android:build:dev      # Debug APK
npm run android:build:prod     # Release APK
```

## ⚙️ Environment Configuration

### Development (.env.development)
```env
API_URL=http://localhost:10000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_PLATFORM=native
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

### Staging (.env.staging)
```env
API_URL=https://staging-api.powermaps.tech
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_PLATFORM=native
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

### Production (.env.production.mobile)
```env
API_URL=https://api.powermaps.tech
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_PLATFORM=native
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=error
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
```

## 🔧 Environment Manager Usage

The project includes a comprehensive environment manager:

```typescript
import { env, isProduction, isDevelopment, isNative } from '@/lib/config/environment';

// Get configuration
console.log('API URL:', env.apiUrl);
console.log('Environment:', env.environment);
console.log('Platform:', env.platform);

// Environment checks
if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isNative()) {
  console.log('Running on mobile device');
}

// API endpoint building
const endpoint = env.getApiEndpoint('/users');
// Returns: https://api.powermaps.tech/users (in production)

// Environment-aware logging
env.log('debug', 'This only shows in development');
env.log('error', 'This shows in all environments');
```

## 🎯 Platform Detection

The system automatically detects the platform:

- **Web**: Browser environment
- **Native**: Capacitor environment (iOS/Android)

Platform detection works at:
- **Build time**: Via `CAPACITOR_BUILD` environment variable
- **Runtime**: Via `window.Capacitor` detection

## 📱 Mobile-Specific Features

### Development Mode Features
- Debug logging enabled
- DevTools available
- Detailed error messages
- Hot reload support

### Production Mode Features
- Optimized bundles
- Minimal logging
- Error reporting
- Performance monitoring

## 🔄 Workflow Examples

### Daily Development
```bash
# Start mobile development
npm run run:android:dev

# Test on iOS
npm run run:ios:dev

# Open in Android Studio for debugging
npm run open:android
```

### Testing & Staging
```bash
# Build staging version
npm run build:android:staging

# Test production build locally
npm run run:android:prod
```

### Production Deployment
```bash
# Build production APK
npm run android:build:prod

# Build production iOS
npm run build:ios:prod
npm run open:ios  # Then archive in Xcode
```

## 🐛 Troubleshooting

### Environment Not Loading
1. Check `.env.*` file exists
2. Verify `NODE_ENV` is set correctly
3. Restart development server

### Wrong API Endpoint
1. Check `NEXT_PUBLIC_API_BASE_URL` in env file
2. Verify environment detection: `console.log(env.environment)`
3. Clear Next.js cache: `rm -rf .next`

### Platform Detection Issues
1. Check `CAPACITOR_BUILD` environment variable
2. Verify `NEXT_PUBLIC_PLATFORM` setting
3. Test runtime detection: `console.log(env.platform)`

## 📋 Environment Variables Reference

| Variable | Description | Values |
|----------|-------------|---------|
| `NODE_ENV` | Build environment | `development`, `staging`, `production` |
| `CAPACITOR_BUILD` | Mobile build flag | `true`, `false` |
| `NEXT_PUBLIC_APP_ENV` | App environment | `development`, `staging`, `production` |
| `NEXT_PUBLIC_PLATFORM` | Target platform | `web`, `native` |
| `NEXT_PUBLIC_DEBUG_MODE` | Debug features | `true`, `false` |
| `NEXT_PUBLIC_LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |
| `NEXT_PUBLIC_API_BASE_URL` | API endpoint | URL string |

## 🎉 Benefits

✅ **Environment Isolation**: Separate configs for dev/staging/prod
✅ **Platform Awareness**: Automatic web/native detection  
✅ **Type Safety**: Full TypeScript support
✅ **Easy Switching**: Simple npm scripts
✅ **Debug Control**: Environment-specific logging
✅ **API Management**: Automatic endpoint resolution
✅ **Build Optimization**: Environment-specific optimizations

This system provides a robust foundation for managing different environments and platforms in your universal PowerMaps application!