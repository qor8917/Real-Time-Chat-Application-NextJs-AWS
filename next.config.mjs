/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

export default nextConfig;
