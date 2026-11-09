import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  transpilePackages: ['@al-waha/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'files.manuscdn.com' },
      { protocol: 'https', hostname: 'speero.net' },
    ],
  },
};
export default nextConfig;
