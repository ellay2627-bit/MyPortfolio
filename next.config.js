/** @type {import('next').NextConfig} */
const OSS_BASE_URL = 'https://my-resume-images-2026.oss-cn-beijing.aliyuncs.com';
const useOssStaticAssets = process.env.NEXT_PUBLIC_USE_OSS_STATIC === 'true';

const nextConfig = {
  reactStrictMode: true,
  assetPrefix: useOssStaticAssets ? OSS_BASE_URL : '',
  images: {
    domains: ['localhost', 'vercel.app', 'cloudflarepages.com', 'ellay.top', 'my-resume-images-2026.oss-cn-beijing.aliyuncs.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three)[\\/]/,
            name: 'three',
            chunks: 'async',
            priority: 40,
          },
          animation: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animation',
            chunks: 'async',
            priority: 30,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/images/works/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/about/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/works-list.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/static/work-:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: true,
};

module.exports = nextConfig;
