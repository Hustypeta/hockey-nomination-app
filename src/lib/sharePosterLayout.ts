/**
 * Šířka layoutu {@link Nhl25SharePoster} / {@link NamesOnlySharePoster} v px (design + export).
 * Vyšší hodnota = větší „siluety“ dresů v mřížce při zachování dvousloupce.
 */
export const SHARE_POSTER_WIDTH_PX = 1120;

/**
 * `pixelRatio` pro html-to-image u exportu plakátu. Dřívější 8–9 znamenalo ~rozlišení 9–10k px na šířku
 * (násobil se i výška) → extrémně pomalý render a PNG.
 * 3–4 stačí pro výstupy s cover cropem až ~1920 px kraťajší strany.
 */
export const SHARE_POSTER_CAPTURE_PIXEL_RATIO = 3;
