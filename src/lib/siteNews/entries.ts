import type { SiteNewsItem } from "@/lib/siteNews/types";

export const SITE_NEWS_PRODUCT_NAME = "Novinky na platformě Lineup";

/** Novinky aplikace — changelog / co je nového (nejnovější první). */
export const SITE_NEWS_ENTRIES: SiteNewsItem[] = [
  {
    id: "novy-design-2026",
    title: "Nový design",
    notificationShort: "Lineup získal nový design.",
    summary: "Lineup získal nový design.",
    imageUrl: "/images/novinky-novy-design.png?v=4",
    homeImageContain: true,
    body: [
      "Modernější. Přehlednější. Interaktivnější.",
      "Lineup v novém stylu je připraven posunout tvoje hokejové zážitky na novou úroveň.",
      "• Intuitivnější rozhraní",
      "• Lepší přehled a navigace",
      "• Rychlejší odezva",
      "• Nové funkce a vylepšení",
    ].join("\n\n"),
    publishedAt: "2026-06-28T12:00:00.000Z",
    tag: "Design",
  },
];

export const SITE_NEWS_HOME_COUNT = 3;

export const NOTIFICATIONS_SEEN_KEY = "lineup-platform-notifications-seen-at";

export function getSiteNewsForHome(limit = SITE_NEWS_HOME_COUNT): SiteNewsItem[] {
  return SITE_NEWS_ENTRIES.slice(0, limit);
}

export function getLatestSiteNewsPublishedAt(): string | null {
  const first = SITE_NEWS_ENTRIES[0];
  return first?.publishedAt ?? null;
}

export function getUnreadSiteNewsCount(): number {
  if (typeof window === "undefined") return SITE_NEWS_ENTRIES.length;
  const seenAt = window.localStorage.getItem(NOTIFICATIONS_SEEN_KEY);
  if (!seenAt) return SITE_NEWS_ENTRIES.length;
  const seenMs = Date.parse(seenAt);
  if (!Number.isFinite(seenMs)) return SITE_NEWS_ENTRIES.length;
  return SITE_NEWS_ENTRIES.filter((e) => Date.parse(e.publishedAt) > seenMs).length;
}

export function markSiteNewsNotificationsSeen(): void {
  if (typeof window === "undefined") return;
  const latest = getLatestSiteNewsPublishedAt();
  window.localStorage.setItem(NOTIFICATIONS_SEEN_KEY, latest ?? new Date().toISOString());
}
