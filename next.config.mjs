/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'njoez812hwdbvies.public.blob.vercel-storage.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
