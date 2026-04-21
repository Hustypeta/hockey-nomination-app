/** Zadní strana českého dresu (PNG v `public/images/`) — jméno a číslo se kreslí v `PremiumJerseySlotCard`. */

const assetV = process.env.NEXT_PUBLIC_ASSET_VERSION?.trim();
const assetQ = assetV && assetV.length > 0 ? `?v=${encodeURIComponent(assetV)}` : "";

/** Soubor: `public/images/cz-jersey-squad-compact.png` — po výměně za novou verzi zvedni `NEXT_PUBLIC_ASSET_VERSION`, ať se obejde CDN cache. */
export const CZ_JERSEY_BACK_BLANK_SRC = `/images/cz-jersey-squad-compact.png${assetQ}`;

/**
 * PNG je široký — `object-cover` + `object-top` zvětší dres a ořízne boční prázdno; stejné ve všech kartách.
 */
export const CZ_JERSEY_CARD_IMG_BASE =
  "absolute inset-0 h-full w-full object-cover object-top";
