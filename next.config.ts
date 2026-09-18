import type { NextConfig } from "next";

/** Aby se po nasazení nového PNG nestahovala stará verze z cache (stejná cesta). */
const assetVersion =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 10) ||
  process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 10) ||
  (process.env.NODE_ENV === "development"
    ? (process.env.NEXT_PUBLIC_DEV_ASSET_VERSION?.trim() || "brand-hockey-1")
    : "brand-hockey-1");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ASSET_VERSION: assetVersion,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.hokejlineup.cz" }],
        destination: "https://hokejlineup.cz/:path*",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "query" as const, key: "cover", value: "true" }],
        destination: "/cover",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "query" as const, key: "cover", value: "1" }],
        destination: "/cover",
        permanent: false,
      },
      { source: "/logo.png", destination: "/images/logo/logo.png", permanent: false },
      { source: "/clanky", destination: "/", permanent: true },
      { source: "/clanky/rady-k-nominaci", destination: "/sestava", permanent: true },
      { source: "/clanky/kurzy-a-analyza-ms-2026", destination: "/bracket", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
