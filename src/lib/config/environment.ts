/**
 * Environment configuration utility
 * Handles different environment settings for web, development, staging, and production
 */

export type Environment = 'development' | 'staging' | 'production';
export type Platform = 'web' | 'native';

interface EnvironmentConfig {
  apiUrl: string;
  wsUrl?: string;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableDevtools: boolean;
  platform: Platform;
  environment: Environment;
}

class EnvironmentManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const env = this.getEnvironment();
    const platform = this.getPlatform();

    // Base configuration
    const baseConfig: EnvironmentConfig = {
      apiUrl:
        process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_URL || 'http://localhost:10000',
      wsUrl: process.env.NEXT_PUBLIC_WS_URL,
      debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
      logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as any) || 'info',
      enableDevtools: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true',
      platform,
      environment: env,
    };

    // Environment-specific overrides
    switch (env) {
      case 'development':
        return {
          ...baseConfig,
          debugMode: true,
          logLevel: 'debug',
          enableDevtools: true,
        };

      case 'staging':
        return {
          ...baseConfig,
          debugMode: true,
          logLevel: 'info',
          enableDevtools: true,
        };

      case 'production':
        return {
          ...baseConfig,
          debugMode: false,
          logLevel: 'error',
          enableDevtools: false,
        };

      default:
        return baseConfig;
    }
  }

  private getEnvironment(): Environment {
    // Check explicit environment variable first
    const explicitEnv = process.env.NEXT_PUBLIC_APP_ENV as Environment;
    if (explicitEnv && ['development', 'staging', 'production'].includes(explicitEnv)) {
      return explicitEnv;
    }

    // Fallback to NODE_ENV (Note: NODE_ENV doesn't support 'staging', only development/production/test)
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') return 'production';
    // For staging, we rely on NEXT_PUBLIC_APP_ENV since NODE_ENV doesn't support it
    return 'development';
  }

  private getPlatform(): Platform {
    // Check explicit platform variable
    const explicitPlatform = process.env.NEXT_PUBLIC_PLATFORM as Platform;
    if (explicitPlatform && ['web', 'native'].includes(explicitPlatform)) {
      return explicitPlatform;
    }

    // Check if it's a Capacitor build
    if (process.env.CAPACITOR_BUILD === 'true') {
      return 'native';
    }

    // Check runtime environment (client-side)
    if (typeof window !== 'undefined') {
      // @ts-ignore - Capacitor global
      if (window.Capacitor) {
        return 'native';
      }
    }

    return 'web';
  }

  // Public getters
  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get wsUrl(): string | undefined {
    return this.config.wsUrl;
  }

  get debugMode(): boolean {
    return this.config.debugMode;
  }

  get logLevel(): string {
    return this.config.logLevel;
  }

  get enableDevtools(): boolean {
    return this.config.enableDevtools;
  }

  get platform(): Platform {
    return this.config.platform;
  }

  get environment(): Environment {
    return this.config.environment;
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  get isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  get isNative(): boolean {
    return this.config.platform === 'native';
  }

  get isWeb(): boolean {
    return this.config.platform === 'web';
  }

  // Get full configuration
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  // Environment-specific API endpoints
  getApiEndpoint(path: string): string {
    const baseUrl = this.apiUrl.replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  // Logging utility
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex >= currentLevelIndex) {
      console[level](`[${this.config.environment.toUpperCase()}]`, message, ...args);
    }
  }
}

// Export singleton instance
export const env = new EnvironmentManager();

// Export utility functions
export const getEnvironment = () => env.environment;
export const getPlatform = () => env.platform;
export const isProduction = () => env.isProduction;
export const isDevelopment = () => env.isDevelopment;
export const isStaging = () => env.isStaging;
export const isNative = () => env.isNative;
export const isWeb = () => env.isWeb;
