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
      // Se você usar imagens de outros lugares (ex: imgur, google), adicione aqui também
    ],
  },
};

export default nextConfig;