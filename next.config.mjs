/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.carlogos.org",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "kupiautoba-e7eb5.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.autobum.ba",
      },
      {
        protocol: "https",
        hostname: "cdn.autoplac.ba",
      },
      {
        protocol: "https",
        hostname: "*.olx.ba",
      },
    ],
  },
};

export default nextConfig;
