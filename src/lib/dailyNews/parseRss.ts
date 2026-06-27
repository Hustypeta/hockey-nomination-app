export type ParsedRssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  imageUrl: string | null;
};

function resolveImageUrl(raw: string, baseUrl: string): string | null {
  try {
    const t = raw.trim();
    if (!t || t.startsWith("data:")) return null;
    const u = new URL(t, baseUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Obrázek z RSS (media, enclosure, img v popisu). */
export function extractRssImageUrl(itemBlock: string, link: string, descriptionRaw: string): string | null {
  const candidates: string[] = [];

  const mediaContent = itemBlock.match(/<media:content[^>]+url=["']([^"']+)["']/gi) ?? [];
  for (const tag of mediaContent) {
    const m = tag.match(/url=["']([^"']+)["']/i);
    if (m?.[1]) candidates.push(m[1]);
  }

  const mediaThumb = itemBlock.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/gi) ?? [];
  for (const tag of mediaThumb) {
    const m = tag.match(/url=["']([^"']+)["']/i);
    if (m?.[1]) candidates.push(m[1]);
  }

  const enclosure = itemBlock.match(/<enclosure[^>]+>/gi) ?? [];
  for (const tag of enclosure) {
    if (!/type=["']image/i.test(tag)) continue;
    const m = tag.match(/url=["']([^"']+)["']/i);
    if (m?.[1]) candidates.push(m[1]);
  }

  const imgInDesc = descriptionRaw.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgInDesc?.[1]) candidates.push(imgInDesc[1]);

  for (const c of candidates) {
    const resolved = resolveImageUrl(c, link);
    if (resolved) return resolved;
  }
  return null;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export function stripHtml(html: string): string {
  return decodeXmlEntities(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(cdata) ?? block.match(plain);
  return m?.[1]?.trim() ?? "";
}

export function parseRssItems(xml: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const title = stripHtml(extractTag(block, "title"));
    const link = extractTag(block, "link") || extractTag(block, "guid");
    const descriptionRaw = extractTag(block, "description");
    const description = stripHtml(descriptionRaw);
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "updateDate") || null;
    const imageUrl = link ? extractRssImageUrl(block, link, descriptionRaw) : null;
    if (!title || !link) continue;
    items.push({ title, link, description, pubDate, imageUrl });
  }
  return items;
}

/** Google News: „Nadpis — Zdroj“ */
export function parseGoogleNewsSource(title: string, fallback: string): { title: string; source: string } {
  const parts = title.split(" - ").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const source = parts[parts.length - 1]!;
    const cleanTitle = parts.slice(0, -1).join(" - ");
    return { title: cleanTitle || title, source };
  }
  return { title, source: fallback };
}
