// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co'       },
      { protocol: 'https', hostname: 'dmn-solution.vercel.app' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY'            },
          { key: 'X-Content-Type-Options',     value: 'nosniff'         },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection',           value: '1; mode=block'  },
        ],
      },
    ];
  },
};

export default config;
