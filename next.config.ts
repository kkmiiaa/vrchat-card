import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
