import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // Permite qualquer caminho dentro desse site
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com', // <--- Permite qualquer bucket da Vercel
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Aumentei para 5MB (pode por '10mb' se precisar)
    },
  }
};

export default nextConfig;