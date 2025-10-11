# Mobile Build Setup Guide

This guide will help you fix Android and iOS build issues for the PowerMaps universal app.

## Current Status

✅ **Capacitor Configuration**: Properly configured with all necessary plugins
✅ **Build System**: Dual build system working (web + native static export)
✅ **Platform Adapters**: Universal adapter system implemented
❌ **Android SDK**: Not configured (causing build failures)
❌ **iOS Development Tools**: CocoaPods not installed

## Quick Fixes

### 1. Android SDK Setup

The immediate issue is that Android SDK is not configured. Here are the solutions:

#### Option A: Install Android Studio (Recommended)
1. Download and install [Android Studio](https://developer.android.com/studio)
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator (optional, for testing)
3. After installation, the SDK will be located at:
   - Windows: `C:\Users\[username]\AppData\Local\Android\Sdk`
   - macOS: `/Users/[username]/Library/Android/sdk`
   - Linux: `/home/[username]/Android/Sdk`
4. Update `android/local.properties` with your actual SDK path

#### Option B: SDK Command Line Tools Only
1. Download [Android SDK Command Line Tools](https://developer.android.com/studio#command-tools)
2. Extract to a folder (e.g., `C:\Android\sdk`)
3. Set environment variables:
   ```bash
   # Windows (PowerShell)
   $env:ANDROID_HOME = "C:\Android\sdk"
   $env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"
   
   # macOS/Linux
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```
4. Install required packages:
   ```bash
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

### 2. iOS Setup (macOS only)

#### Install CocoaPods
```bash
# Install CocoaPods
sudo gem install cocoapods

# Navigate to iOS project and install dependencies
cd ios/App
pod install
```

#### Install Xcode
1. Install Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```

## Build Commands

Once the SDK is configured, use these commands:

### Android
```bash
# Build and sync Android
npm run build:android

# Run on Android device/emulator
npm run cap:run:android

# Open in Android Studio
npm run cap:open:android

# Build APK manually
npm run android:build
```

### iOS (macOS only)
```bash
# Build and sync iOS
npm run build:ios

# Run on iOS simulator
npm run cap:run:ios

# Open in Xcode
npm run cap:open:ios
```

## Troubleshooting

### Common Android Issues

1. **Gradle Build Failed**
   - Ensure Android SDK is properly installed
   - Check `android/local.properties` has correct SDK path
   - Try cleaning: `cd android && ./gradlew clean`

2. **SDK Location Not Found**
   - Update `android/local.properties` with correct path
   - Set `ANDROID_HOME` environment variable

3. **Build Tools Version Issues**
   - Update `android/variables.gradle` if needed
   - Install required build tools version

### Common iOS Issues

1. **CocoaPods Not Found**
   - Install CocoaPods: `sudo gem install cocoapods`
   - Run `pod install` in `ios/App` directory

2. **Xcode Build Issues**
   - Open project in Xcode and resolve any signing issues
   - Ensure iOS deployment target matches project settings

## Platform Adapter System

The app now includes a universal platform adapter system that:

- ✅ Automatically detects web vs native environment
- ✅ Provides unified APIs for storage, HTTP, notifications, geolocation, camera, and device info
- ✅ Handles platform-specific implementations transparently
- ✅ Includes comprehensive error handling and fallbacks

### Usage Example

```typescript
import { getStorageAdapter, getHttpClient, isNative } from '@/lib/platform';

// Automatically uses localStorage on web, Capacitor Preferences on native
const storage = await getStorageAdapter();
await storage.set('key', 'value');

// Automatically uses axios on web, Capacitor HTTP on native
const http = await getHttpClient();
const data = await http.get('/api/data');

// Platform detection
if (isNative()) {
  // Native-specific code
} else {
  // Web-specific code
}
```

## Next Steps

1. **Install Android SDK** using one of the methods above
2. **Update android/local.properties** with your SDK path
3. **Test Android build**: `npm run build:android`
4. **Install iOS tools** (if on macOS): CocoaPods and Xcode
5. **Test iOS build**: `npm run build:ios`

## Verification

After setup, verify everything works:

```bash
# Check Android build
npm run build:android
# Should complete without errors

# Check iOS build (macOS only)
npm run build:ios
# Should complete without errors

# Test platform adapters
npm test -- --testPathPattern=platform
# Should pass all platform adapter tests
```

## Support

If you encounter issues:

1. Check the error messages carefully
2. Ensure all prerequisites are installed
3. Verify file paths in configuration files
4. Try cleaning and rebuilding: `npm run build:native`

The platform adapter system is now complete and ready for use. Once the SDK is configured, you'll have a fully functional universal app that runs on web, iOS, and Android with shared code and platform-specific optimizations.