/** Značka aplikace — jednotně v meta, hlavičce a úvodu. */
/** Jediná kanonická veřejná doména (bez www) — og:url, metadataBase, přesměrování. */
export const SITE_CANONICAL_HOST = "hokejlineup.cz" as const;

const assetV = process.env.NEXT_PUBLIC_ASSET_VERSION?.trim();
const assetQ = assetV && assetV.length > 0 ? `?v=${encodeURIComponent(assetV)}` : "";

/** Odkazy na soubory v `public/images/` (hlavička, favicon). `?v=` obchází agresivní cache po výměně obrázku. */
export const SITE_LOGO_URL = `/images/logo.png${assetQ}`;
export const SITE_ICON_URL = `/images/icon.png${assetQ}`;

/** Výchozí OG/Twitter náhled odkazu — plakát (dresy MS 2026). Rozměry musí odpovídat souboru (po úpravách spusť `node scripts/pad-og-top.mjs`). */
export const SITE_OG_DEFAULT_IMAGE_URL = `/images/promo/og-share-ms2026-jerseys.png${assetQ}`;
export const SITE_OG_DEFAULT_IMAGE_WIDTH = 1024;
export const SITE_OG_DEFAULT_IMAGE_HEIGHT = 533;

export const SITE_BRAND = "Lineup";

/** Dlouhý název produktu — hlavní wordmark v hlavičce (vedle loga). */
export const SITE_WORDMARK = "Hockey Nomination";

/** Kontakt pro dotazy k GDPR / osobním údajům (nastavte v .env na produkci). */
export const SITE_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "kontakt@hokejlineup.cz";

/** Veřejná FB stránka projektu (paticka — ikona). */
export const SITE_FACEBOOK_PAGE_URL =
  "https://www.facebook.com/profile.php?id=61568992616673";

/** Volitelné — ikona v patičce se aktivuje po doplnění URL (nebo přes NEXT_PUBLIC_* na produkci). */
export const SITE_INSTAGRAM_PAGE_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_PAGE_URL?.trim() ?? "";
export const SITE_X_PAGE_URL = process.env.NEXT_PUBLIC_X_PAGE_URL?.trim() ?? "";
export const SITE_TIKTOK_PAGE_URL = process.env.NEXT_PUBLIC_TIKTOK_PAGE_URL?.trim() ?? "";

/**
 * Sjednotí `www.hokejlineup.cz` → `hokejlineup.cz` (Open Graph, NextAuth, sdílení).
 * Ostatní hostitelé (localhost, Railway preview) se nemění.
 */
export function toCanonicalHokejlineupUrl(href: string | URL): URL {
  const u = typeof href === "string" ? new URL(href) : new URL(href.toString());
  if (u.hostname === `www.${SITE_CANONICAL_HOST}`) {
    u.hostname = SITE_CANONICAL_HOST;
  }
  return u;
}
