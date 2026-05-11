/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'vercel.app'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  experimental: {
    optimizeCss: true,
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;