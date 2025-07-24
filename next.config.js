/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.charge-tn.com'], // Add your API domains here
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
}

module.exports = nextConfig;