/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.charge-tn.com'], // Add your API domains here
    unoptimized: process.env.CAPACITOR_BUILD === 'true', // Disable image optimization for Capacitor builds
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
  // Enable static export for Capacitor builds
  ...(process.env.CAPACITOR_BUILD === 'true' && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
  }),
}

module.exports = nextConfig;