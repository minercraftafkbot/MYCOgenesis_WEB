/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
        "http://localhost:3000",
        "https://3000-firebase-mycogenesiswebgit-1756270438124.cluster-y3k7ko3fang56qzieg3trwgyfg.cloudworkstations.dev"
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
