/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: false,
  },
  images: {
    domains: ['localhost', 'api.charge-tn.com', 'api.powermaps.com'],
    unoptimized: isCapacitorBuild, // Disable image optimization for Capacitor builds
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
    CAPACITOR_BUILD: process.env.CAPACITOR_BUILD || 'false',
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
    }
    return config;
  },
}

module.exports = nextConfig;