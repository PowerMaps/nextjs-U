import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.powermaps.app',
  appName: 'PowerMaps',
  webDir: 'public', // Will be 'out' for static export, 'public' for development
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1f2937',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1f2937'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    },
    App: {
      windowTitleBarStyle: 'default'
    }
  },
  ios: {
    scheme: 'PowerMaps',
    contentInset: 'automatic'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: 'APK'
    },
    backgroundColor: '#1f2937'
  }
};

export default config;
