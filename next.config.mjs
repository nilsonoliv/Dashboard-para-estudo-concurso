/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/',
      },
      {
        source: '/assets/html/simulado.html',
        destination: '/simulado',
      },
    ];
  },
};

export default nextConfig;
