import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/logo.png", destination: "/images/logo.png", permanent: false },
      { source: "/icon.png", destination: "/images/icon.png", permanent: false },
    ];
  },
};

export default nextConfig;
