import type { ParsedRssItem } from "@/lib/dailyNews/parseRss";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function toAbsoluteUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

/** Zprávy z https://www.livesport.cz/zpravy/hokej/ (odkaz z /hokej/). */
export function parseLivesportHokejNews(html: string, pageUrl: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  const seen = new Set<string>();
  const articleRe =
    /<a\s+href="(\/zpravy\/hokej[^"]+\/[A-Za-z0-9]+\/)"[^>]*data-testid="wcl-newsArticlePreview"[^>]*(?:title="([^"]*)")?[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;

  for (const match of html.matchAll(articleRe)) {
    const href = match[1];
    if (!href || seen.has(href)) continue;
    seen.add(href);

    const titleRaw = (match[2] || match[3] || "").replace(/<[^>]+>/g, " ").trim();
    const title = decodeHtmlEntities(titleRaw);
    if (!title) continue;

    items.push({
      title,
      link: toAbsoluteUrl(pageUrl, href),
      description: title,
      pubDate: new Date(Date.now() - items.length * 60_000).toISOString(),
      imageUrl: null,
    });
  }

  return items;
}

/** Sekce „Novinky o českých hráčích“ na https://www.nhl.com/cs */
export function parseNhlCsCzechPlayersNews(html: string, pageUrl: string): ParsedRssItem[] {
  const marker = "Novinky o";
  const start = html.indexOf(marker);
  if (start < 0) return [];

  const nextSection = html.slice(start + 800).search(/Forček|Forcek|For\u010dek/);
  const sectionEnd = nextSection > 0 ? start + 800 + nextSection : start + 45_000;
  const section = html.slice(start, sectionEnd);

  const items: ParsedRssItem[] = [];
  const seen = new Set<string>();

  for (const match of section.matchAll(
    /<a class="nhl-c-card-wrap[^"]*"[\s\S]*?href="(\/cs\/(?:news|video)\/[^"]+)"[\s\S]*?<\/a>/gi,
  )) {
    const href = match[1];
    if (!href || seen.has(href)) continue;
    seen.add(href);

    const block = match[0];
    const titleMatch =
      block.match(/<h3[^>]*__title[^>]*>([^<]{4,})</i) ??
      block.match(/nhl-c-card__title[\s\S]{0,160}?>([^<]{4,})</) ??
      block.match(/aria-label="([^"]{8,})"/);

    const titleRaw = titleMatch?.[1]?.trim() ?? "";
    const title = decodeHtmlEntities(titleRaw);
    if (!title) continue;

    items.push({
      title,
      link: toAbsoluteUrl(pageUrl, href),
      description: title,
      pubDate: new Date(Date.now() - items.length * 60_000).toISOString(),
      imageUrl: null,
    });
  }

  return items;
}
