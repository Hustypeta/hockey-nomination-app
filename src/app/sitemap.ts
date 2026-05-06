import type { MetadataRoute } from "next";

const site = "https://hokejlineup.cz";

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
  const now = new Date();
  return staticRoutes.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/sestava" ? 0.9 : 0.7,
  }));
}

