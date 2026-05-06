import type { MetadataRoute } from "next";

const site = "https://hokejlineup.cz";

// Keep sitemap stable and cacheable (and never 500).
export const revalidate = 3600;

const staticRoutes = [
  "/",
  "/sestava",
  "/zapasy",
  "/zapasy/beijir",
  "/zapasy/ms-2026",
  "/clanky/rady-k-nominaci",
  "/clanky/kurzy-a-analyza-ms-2026",
  "/pravidla-souteze",
  "/zebricek",
  "/bracket",
  "/kdo-jsem",
  "/ochrana-udaju",
];

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    const nowIso = new Date().toISOString();
    return staticRoutes.map((path) => ({
      url: `${site}${path}`,
      lastModified: nowIso,
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1 : path === "/sestava" ? 0.9 : 0.7,
    }));
  } catch {
    // Absolute fallback: minimal sitemap.
    return [{ url: `${site}/`, lastModified: "2026-01-01T00:00:00.000Z" }];
  }
}

