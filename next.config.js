/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'vercel.app', 'cloudflarepages.com', 'ellay.top', 'my-resume-images-2026.oss-cn-beijing.aliyuncs.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // 直接用 OSS 的优化，不需要 Next.js 再优化
  },
  // 排除大文件夹不部署！这是关键！
  webpack: (config, { isServer, dev }) => {
    // 只在生产构建时排除，本地开发不受影响！
    if (!dev && !isServer) {
      // 忽略 works 文件夹，不打包到前端！
      const originalIgnorePatterns = config.watchOptions?.ignored || [];
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [...(Array.isArray(originalIgnorePatterns) ? originalIgnorePatterns : [originalIgnorePatterns]), '**/public/images/works/**'],
      };
      
      // 分割大库
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // 单独处理 Three.js，非常大！
          three: {
            test: /[\\/]node_modules[\\/](three)[\\/]/,
            name: 'three',
            chunks: 'async', // 必须异步加载！
            priority: 40,
          },
          // 动画库分割
          animation: {
            test: /[\\/]node_modules[\\/](framer-motion|gsap|motion)[\\/]/,
            name: 'animation',
            chunks: 'async', // 只用于异步加载！
            priority: 30,
          },
          // React 核心库
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // UI 组件库
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
  // 优化构建输出
  output: 'standalone', // 更小的部署包
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
      // 优化静态资源缓存
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
  // 优化服务器端渲染
  poweredByHeader: false,
  generateEtags: true,
};

module.exports = nextConfig;
