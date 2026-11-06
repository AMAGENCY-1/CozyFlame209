import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    // No ESLint setup yet; TypeScript still checks every build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
