const site = "https://hokejlineup.cz";

export const revalidate = 3600;

const staticRoutes = [
  "/",
  "/sestava",
  "/fantasy",
  "/clanky/rady-k-nominaci",
  "/clanky/kurzy-a-analyza-ms-2026",
  "/pravidla-souteze",
  "/zebricek",
  "/bracket",
  "/kdo-jsem",
  "/ochrana-udaju",
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
    const nowIso = new Date().toISOString();
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      staticRoutes
        .map((path) => {
          const loc = `${site}${path}`;
          const changefreq = path === "/" ? "daily" : "weekly";
          const priority = path === "/" ? "1.0" : path === "/sestava" ? "0.9" : "0.7";
          return (
            `<url>` +
            `<loc>${escapeXml(loc)}</loc>` +
            `<lastmod>${escapeXml(nowIso)}</lastmod>` +
            `<changefreq>${changefreq}</changefreq>` +
            `<priority>${priority}</priority>` +
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
    // Absolute fallback: never 5xx (Google treats it as "can't read").
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}

