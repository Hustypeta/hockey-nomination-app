const site = "https://hokejlineup.cz";

export const revalidate = 3600;

type SitemapEntry = {
  path: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
};

/**
 * lastmod = reálné datum poslední obsahové změny, ne „teď“.
 * Při úpravě stránky aktualizuj datum tady.
 */
const publicRoutes: SitemapEntry[] = [
  { path: "/", lastmod: "2026-09-18", changefreq: "daily", priority: "1.0" },
  { path: "/sestava", lastmod: "2026-09-18", changefreq: "weekly", priority: "0.9" },
  { path: "/zapasy/sestava", lastmod: "2026-09-18", changefreq: "weekly", priority: "0.9" },
  { path: "/souteze", lastmod: "2026-09-18", changefreq: "weekly", priority: "0.8" },
  { path: "/souteze/historical-lineup", lastmod: "2026-09-18", changefreq: "weekly", priority: "0.8" },
  { path: "/souteze/extraliga", lastmod: "2026-09-18", changefreq: "weekly", priority: "0.8" },
  { path: "/souteze/ceska-reprezentace/a-tym", lastmod: "2026-09-01", changefreq: "monthly", priority: "0.6" },
  { path: "/forum", lastmod: "2026-09-18", changefreq: "daily", priority: "0.7" },
  { path: "/pravidla-souteze", lastmod: "2026-05-15", changefreq: "monthly", priority: "0.5" },
  { path: "/zebricek", lastmod: "2026-06-01", changefreq: "weekly", priority: "0.6" },
  { path: "/kdo-jsem", lastmod: "2026-05-01", changefreq: "monthly", priority: "0.4" },
  { path: "/ochrana-udaju", lastmod: "2026-05-01", changefreq: "monthly", priority: "0.3" },
  { path: "/novinky", lastmod: "2026-06-28", changefreq: "weekly", priority: "0.5" },
  { path: "/daily-news", lastmod: "2026-09-18", changefreq: "daily", priority: "0.6" },
  { path: "/hraci", lastmod: "2026-09-06", changefreq: "weekly", priority: "0.6" },
  { path: "/bracket", lastmod: "2026-05-15", changefreq: "monthly", priority: "0.3" },
];

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(): Promise<Response> {
  try {
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      publicRoutes
        .map((route) => {
          const loc = `${site}${route.path}`;
          return (
            `<url>` +
            `<loc>${escapeXml(loc)}</loc>` +
            `<lastmod>${escapeXml(route.lastmod)}</lastmod>` +
            `<changefreq>${route.changefreq}</changefreq>` +
            `<priority>${route.priority}</priority>` +
            `</url>`
          );
        })
        .join("") +
      `</urlset>`;

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } },
    );
  }
}
