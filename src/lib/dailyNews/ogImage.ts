const OG_CACHE_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const HTML_SLICE = 120_000;

const FETCH_HEADERS = {
  "User-Agent": "HokejLineup/1.0 (+https://hokejlineup.cz; og-preview)",
  Accept: "text/html,application/xhtml+xml",
};

const ogCache = new Map<string, { at: number; url: string | null }>();

function normalizeImageUrl(raw: string, pageUrl: string): string | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("data:")) return null;
    const resolved = new URL(trimmed, pageUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.href;
  } catch {
    return null;
  }
}

export function parseOgImageFromHtml(html: string, pageUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/gi,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/gi,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    const m = re.exec(html);
    if (m?.[1]) {
      const url = normalizeImageUrl(m[1], pageUrl);
      if (url) return url;
    }
  }
  return null;
}

export async function fetchOgImage(pageUrl: string): Promise<string | null> {
  const cached = ogCache.get(pageUrl);
  if (cached && Date.now() - cached.at < OG_CACHE_MS) return cached.url;

  let result: string | null = null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(pageUrl, {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      ogCache.set(pageUrl, { at: Date.now(), url: null });
      return null;
    }
    const html = (await res.text()).slice(0, HTML_SLICE);
    result = parseOgImageFromHtml(html, pageUrl);
  } catch {
    result = null;
  } finally {
    clearTimeout(timeout);
  }

  ogCache.set(pageUrl, { at: Date.now(), url: result });
  return result;
}
