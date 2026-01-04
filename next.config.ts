import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.astronauts.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'culinamarket.com',
      },
      {
        protocol: 'https',
        hostname: 'www.static-src.com',
      },
      {
        protocol: 'https',
        hostname: 'lyunstahvtccahmuydob.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'media.post.rvohealth.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'img.id.my-best.com',
      },
    ],
  },
};

export default nextConfig;
