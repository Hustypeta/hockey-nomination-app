/** Značka aplikace — jednotně v meta, hlavičce a úvodu. */
const assetV = process.env.NEXT_PUBLIC_ASSET_VERSION?.trim();
const assetQ = assetV && assetV.length > 0 ? `?v=${encodeURIComponent(assetV)}` : "";

/** Odkazy na soubory v `public/images/` (hlavička, favicon). `?v=` obchází agresivní cache po výměně obrázku. */
export const SITE_LOGO_URL = `/images/logo.png${assetQ}`;
export const SITE_ICON_URL = `/images/icon.png${assetQ}`;

export const SITE_BRAND = "Lineup";

/** Dlouhý název produktu — hlavní wordmark v hlavičce (vedle loga). */
export const SITE_WORDMARK = "Hockey Nomination";
