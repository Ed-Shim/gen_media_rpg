/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        pathname: '/files/**',
      },
    ],
  },
};

export default nextConfig;
