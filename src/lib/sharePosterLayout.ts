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

/** Instagram příspěvek — poměr 4 : 5 (1080 × 1350 px). */
export const SHARE_POSTER_4X5_W = NOMINATION_WEB_POSTER_W;
export const SHARE_POSTER_4X5_H = 1350;

/** Forum feed — Instagram portrait 4 : 5 (referenční šířka 351 px). */
export const FORUM_POST_FRAME_W = 351;
export const FORUM_POST_FRAME_H = Math.round(
  (FORUM_POST_FRAME_W * SHARE_POSTER_4X5_H) / SHARE_POSTER_4X5_W
);
export const FORUM_POST_FRAME_ASPECT = "4 / 5" as const;

/** Měřítko plakátu tak, aby vyplnil celé forum okno (cover, mírný ořez okrajů). */
export function computeForumPosterCoverScale(
  frameW: number,
  frameH: number,
  posterW = NOMINATION_WEB_POSTER_W,
  posterH = NOMINATION_WEB_POSTER_H
): number {
  if (frameW <= 0 || frameH <= 0) return 0.22;
  return Math.max(frameW / posterW, frameH / posterH);
}

/** Měřítko plakátu tak, aby se vešel celý do forum okna (contain, bez ořezu). */
export function computeForumPosterContainScale(
  frameW: number,
  frameH: number,
  posterW = NOMINATION_WEB_POSTER_W,
  posterH = NOMINATION_WEB_POSTER_H
): number {
  if (frameW <= 0 || frameH <= 0 || posterW <= 0 || posterH <= 0) return 0.22;
  return Math.min(frameW / posterW, frameH / posterH);
}

/** Export PNG rámu fóra — 2× referenční rozměr kvůli ostrosti na Retině. */
export const FORUM_POSTER_EXPORT_PIXEL_RATIO = 2;

/** Instagram / sdílení — poměr 3 : 4 (šířka × výška). */
export const SHARE_POSTER_3X4_W = NOMINATION_WEB_POSTER_W;
export const SHARE_POSTER_3X4_H = NOMINATION_WEB_POSTER_H;

/**
 * Rozměry plakátu 3 : 4 — šířka fixní, výška podle obsahu (capture nesmí ořezávat soupisku).
 * Finální PNG 1080×1440 doplní {@link letterboxCanvas} při stažení.
 */
export const SHARE_POSTER_3X4_STYLE = {
  width: SHARE_POSTER_3X4_W,
  minWidth: SHARE_POSTER_3X4_W,
  maxWidth: SHARE_POSTER_3X4_W,
  minHeight: SHARE_POSTER_3X4_H,
} as const;

/** Celá soupiska s dresy — fixní plátno 4 : 5 pro Instagram feed. */
export const SHARE_POSTER_ROSTER_4X5_STYLE = {
  width: SHARE_POSTER_4X5_W,
  height: SHARE_POSTER_4X5_H,
  minWidth: SHARE_POSTER_4X5_W,
  maxWidth: SHARE_POSTER_4X5_W,
  minHeight: SHARE_POSTER_4X5_H,
  maxHeight: SHARE_POSTER_4X5_H,
  boxSizing: "border-box" as const,
} as const;

/** @deprecated Použij {@link SHARE_POSTER_ROSTER_4X5_STYLE}. */
export const SHARE_POSTER_ROSTER_FLOW_STYLE = {
  width: SHARE_POSTER_4X5_W,
  minWidth: SHARE_POSTER_4X5_W,
  maxWidth: SHARE_POSTER_4X5_W,
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
