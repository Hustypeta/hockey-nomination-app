import { createHash } from "crypto";
import { DAILY_NEWS_CACHE_MS, DAILY_NEWS_FEEDS, DAILY_NEWS_HOME_COUNT } from "@/lib/dailyNews/feeds";
import { matchesCzechHockeyNews, normalizeForMatch } from "@/lib/dailyNews/czechHockeyFilter";
import {
  parseGoogleNewsSource,
  parseRssItems,
  stripHtml,
  type ParsedRssItem,
} from "@/lib/dailyNews/parseRss";
import {
  parseLivesportHokejNews,
  parseNhlCsCzechPlayersNews,
} from "@/lib/dailyNews/parseHtmlNews";
import { resolveGoogleNewsUrl } from "@/lib/dailyNews/resolveGoogleNewsUrl";
import type { DailyNewsFeedConfig, DailyNewsItem } from "@/lib/dailyNews/types";

const FETCH_HEADERS = {
  "User-Agent": "HokejLineup/1.0 (+https://hokejlineup.cz; daily-news)",
  Accept: "application/rss+xml, application/xml, text/xml, text/html, */*",
};

let cache: { at: number; v: number; items: DailyNewsItem[] } | null = null;
const CACHE_VERSION = 10;

function normalizeTitleKey(title: string): string {
  return normalizeForMatch(title)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrlKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function areTitlesSimilar(a: string, b: string): boolean {
  const ka = normalizeTitleKey(a);
  const kb = normalizeTitleKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;

  const minLen = Math.min(ka.length, kb.length);
  if (minLen >= 25) {
    const prefixLen = Math.floor(minLen * 0.65);
    if (ka.slice(0, prefixLen) === kb.slice(0, prefixLen)) return true;
  }

  const wordsA = ka.split(" ").filter((w) => w.length > 3);
  if (wordsA.length < 3) return false;
  const wordsB = new Set(kb.split(" ").filter((w) => w.length > 3));
  const overlap = wordsA.filter((w) => wordsB.has(w)).length;
  return overlap / wordsA.length >= 0.75;
}

function dedupeNewsItems(items: DailyNewsItem[]): DailyNewsItem[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const kept: DailyNewsItem[] = [];

  for (const item of items) {
    const urlKey = normalizeUrlKey(item.url);
    const titleKey = normalizeTitleKey(item.title);
    if (seenUrls.has(urlKey)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;
    if (kept.some((existing) => areTitlesSimilar(existing.title, item.title))) continue;

    seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    kept.push(item);
  }

  return kept;
}

function cleanEliteProspectsDescription(description: string): string {
  return description
    .replace(/Source:\s*You need a free account[^.]*\.?/gi, "")
    .replace(/Sign In\/Up/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveFeedUrl(url: string, feed: DailyNewsFeedConfig): string {
  if ((feed.mode === "nhl_com" || feed.mode === "nhl_cs_czech") && url.startsWith("/")) {
    return `https://www.nhl.com${url}`;
  }
  return url;
}

/** Delší perex pro kartu na úvodu — krátký (120) by nechal polovinu karty prázdnou. */
export const DAILY_NEWS_HOME_SUMMARY_MAX = 420;

function truncateSummary(text: string, max = DAILY_NEWS_HOME_SUMMARY_MAX): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function itemId(url: string, title: string): string {
  return createHash("sha256").update(`${url}|${title}`).digest("hex").slice(0, 16);
}

function parseDate(pubDate: string | null): number {
  if (!pubDate) return 0;
  const t = Date.parse(pubDate);
  return Number.isFinite(t) ? t : 0;
}

function toDailyNewsItem(
  raw: ParsedRssItem,
  feed: DailyNewsFeedConfig
): DailyNewsItem | null {
  let title = raw.title;
  let source = feed.source;
  let url = raw.link;

  if (feed.mode === "google") {
    const parsed = parseGoogleNewsSource(raw.title, feed.source);
    title = parsed.title;
    source = parsed.source;
    url = resolveGoogleNewsUrl(raw.link);
  }

  url = resolveFeedUrl(url, feed);

  if (!matchesCzechHockeyNews(title, raw.description, url, feed.mode)) {
    return null;
  }

  const descriptionText =
    feed.mode === "elite_prospects"
      ? cleanEliteProspectsDescription(raw.description)
      : stripHtml(raw.description);

  const summary =
    truncateSummary(descriptionText) ||
    (feed.mode === "elite_prospects"
      ? `Potvrzený přestup — ${title}`
      : "Krátká zpráva o českém hokeji — celý článek na webu zdroje.");

  return {
    id: itemId(url, title),
    title,
    summary,
    url,
    source,
    publishedAt: raw.pubDate,
    imageUrl: raw.imageUrl,
  };
}

async function fetchFeedHtml(
  feed: DailyNewsFeedConfig,
  parse: (html: string, pageUrl: string) => ParsedRssItem[],
): Promise<ParsedRssItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(feed.url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parse(html, feed.url);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFeedItems(feed: DailyNewsFeedConfig): Promise<ParsedRssItem[]> {
  if (feed.mode === "livesport_html") {
    return fetchFeedHtml(feed, parseLivesportHokejNews);
  }
  if (feed.mode === "nhl_cs_czech") {
    return fetchFeedHtml(feed, parseNhlCsCzechPlayersNews);
  }
  return fetchFeedXml(feed);
}

async function fetchFeedXml(feed: DailyNewsFeedConfig): Promise<ParsedRssItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(feed.url, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    if (!xml.includes("<item")) return [];
    return parseRssItems(xml);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDailyNews(limit = 24): Promise<DailyNewsItem[]> {
  const now = Date.now();
  if (cache && cache.v === CACHE_VERSION && now - cache.at < DAILY_NEWS_CACHE_MS) {
    return cache.items.slice(0, limit);
  }

  const results = await Promise.all(
    DAILY_NEWS_FEEDS.map(async (feed) => {
      const parsed = await fetchFeedItems(feed);
      return parsed
        .map((item) => toDailyNewsItem(item, feed))
        .filter((x): x is DailyNewsItem => x !== null);
    })
  );

  const merged = dedupeNewsItems(
    results
      .flat()
      .sort((a, b) => parseDate(b.publishedAt) - parseDate(a.publishedAt))
  );

  const items = merged.length > 0 ? merged : getFallbackNews();

  cache = { at: now, v: CACHE_VERSION, items };
  return items.slice(0, limit);
}

export async function fetchDailyNewsForHome(): Promise<DailyNewsItem[]> {
  const all = await fetchDailyNews(Math.max(DAILY_NEWS_HOME_COUNT * 3, 15));
  return all.slice(0, Math.max(DAILY_NEWS_HOME_COUNT, all.length));
}

function getFallbackNews(): DailyNewsItem[] {
  return [
    {
      id: "fallback-1",
      title: "Lineup News se načítá ze zdrojů",
      summary: "Zprávy ze Sport.cz, Livesport.cz, ČT Sport a NHL.com/cs — obnov stránku za chvíli.",
      url: "https://www.sport.cz/sekce/hokej-32",
      source: "Sport.cz",
      publishedAt: null,
      imageUrl: null,
    },
  ];
}
