/**
 * Šířka layoutu {@link Nhl25SharePoster} / {@link NamesOnlySharePoster} v px (design + export).
 * Vyšší hodnota = větší „siluety“ dresů v mřížce při zachování dvousloupce.
 */
export const SHARE_POSTER_WIDTH_PX = 1120;

/**
 * Instagram feed — poměr 3 : 4 (1080 × 1440 px).
 * Sdílené plakáty nominace i zápasové exporty používají tento rozměr; {@link SHARE_POSTER_WIDTH_PX} zůstává jen pro starší náhledy / marketing.
 */
export const NOMINATION_WEB_POSTER_W = 1080;
export const NOMINATION_WEB_POSTER_H = 1440;

/** Instagram / sdílení — poměr 3 : 4 (šířka × výška). */
export const SHARE_POSTER_3X4_W = NOMINATION_WEB_POSTER_W;
export const SHARE_POSTER_3X4_H = NOMINATION_WEB_POSTER_H;

/** Fixní rozměry plakátu 3 : 4 pro inline `style` u exportních DOM uzlů. */
export const SHARE_POSTER_3X4_STYLE = {
  width: SHARE_POSTER_3X4_W,
  height: SHARE_POSTER_3X4_H,
  minHeight: SHARE_POSTER_3X4_H,
  maxHeight: SHARE_POSTER_3X4_H,
  maxWidth: SHARE_POSTER_3X4_W,
} as const;

/**
 * `pixelRatio` pro html-to-image u exportu plakátu. Dřívější 8–9 znamenalo ~rozlišení 9–10k px na šířku
 * (násobil se i výška) → extrémně pomalý render a PNG.
 * Webová grafika nominace (~vysoká stránka): area limit drží ostřejší řádek ~2–3×; hodnotu 4 stále
 * ubírá safePosterCapturePixelRatio na bezpečno (hrana / plocha / WebKit 4096).
 */
export const SHARE_POSTER_CAPTURE_PIXEL_RATIO = 4;

/**
 * WebKit na iOS padá / hází při `toDataURL`, když canvas překročí ~4096 px na stranu nebo velkou plochu.
 * {@link captureElementToCanvas} výsledný ratio automaticky sníží podle rozměrů DOMu.
 */
export const SHARE_POSTER_MAX_CANVAS_EDGE_PX = 4096;
