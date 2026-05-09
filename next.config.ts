import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      // Clean URL for the VRChat card maker
      { source: "/card/vrchat", destination: "/tools/vrchat-introduction-card" },
    ];
  },
  async redirects() {
    return [
      // Normalize legacy paths to the new clean URL structure
      {
        source: "/card",
        destination: "/card/vrchat",
        permanent: true,
      },
      {
        source: "/tools/vrchat-introduction-card",
        destination: "/card/vrchat",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
