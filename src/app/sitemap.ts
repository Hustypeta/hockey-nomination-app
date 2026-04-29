import type { MetadataRoute } from "next";

const site = "https://hokejlineup.cz";

const staticRoutes = [
  "/",
  "/sestava",
  "/pravidla-souteze",
  "/zebricek",
  "/bracket",
  "/forum",
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

