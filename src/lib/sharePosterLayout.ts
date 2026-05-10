/**
 * Šířka layoutu {@link Nhl25SharePoster} / {@link NamesOnlySharePoster} v px (design + export).
 * Vyšší hodnota = větší „siluety“ dresů v mřížce při zachování dvousloupce.
 */
export const SHARE_POSTER_WIDTH_PX = 1120;

/**
 * Instagram feed — poměr 3 : 4 (1080 × 1440 px).
 * Webová grafika nominace má nativně tento rozměr; ostatní plakáty zůstávají na {@link SHARE_POSTER_WIDTH_PX}.
 */
export const NOMINATION_WEB_POSTER_W = 1080;
export const NOMINATION_WEB_POSTER_H = 1440;

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
