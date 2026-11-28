import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.next.json',
  },
  ...(isDevelopment
    ? {
        async rewrites() {
          return {
            // beforeFiles mendahului halaman catch-all App Router. Health dikecualikan
            // eksplisit agar rute yang sudah dimigrasi selalu menang atas proxy.
            beforeFiles: [
              {
                source: '/api/:path((?!health(?:/|$)).*)',
                destination: 'http://127.0.0.1:3001/api/:path',
              },
            ],
          };
        },
      }
    : {}),
};

export default nextConfig;
