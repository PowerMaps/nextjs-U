/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: false,
  },
  images: {
    domains: [
      'localhost', 
      'api.charge-tn.com', 
      'api.powermaps.com', 
      'api.powermaps.tech',
      'staging-api.powermaps.tech'
    ],
    unoptimized: isCapacitorBuild, // Disable image optimization for Capacitor builds
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:10000',
    CAPACITOR_BUILD: process.env.CAPACITOR_BUILD || 'false',
    BUILD_ENV: process.env.NODE_ENV || 'development',
  },
  // Enable static export for Capacitor builds
  ...(isCapacitorBuild && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
    // Disable features that don't work with static export
    images: {
      unoptimized: true,
    },
  }),
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer && isCapacitorBuild) {
      // Optimize for mobile builds
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
      
      // Add environment-specific optimizations
      if (isProduction) {
        config.optimization.minimize = true;
      }
    }
    
    // Environment-specific webpack configurations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    return config;
  },
  
  // Environment-specific configurations
  ...(isDevelopment && {
    // Development-specific settings
    devIndicators: {
      buildActivity: true,
    },
  }),
  
  ...(isProduction && {
    // Production-specific settings
    compress: true,
    poweredByHeader: false,
  }),
}

module.exports = nextConfig;