import type { NextConfig } from "next";

/** Aby se po nasazení nového PNG nestahovala stará verze z cache (stejná cesta). */
const assetVersion =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 10) ||
  (process.env.NODE_ENV === "development" ? `dev-${Date.now()}` : "1");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ASSET_VERSION: assetVersion,
  },
  async redirects() {
    return [
      { source: "/logo.png", destination: "/images/logo.png", permanent: false },
      { source: "/icon.png", destination: "/images/icon.png", permanent: false },
    ];
  },
};

export default nextConfig;
