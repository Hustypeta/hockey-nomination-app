/** Geometrie FUT osmiúhelníku — čtvercový viewBox 100×100. */
export const FIFA_RINK_SHIELD_VIEWBOX = { w: 100, h: 100 } as const;

/** Symetrický osmiúhelník (zkosené všechny 4 rohy) jako na referenčním ledě. */
export const FIFA_RINK_SHIELD_POINTS = "17,1 83,1 99,17 99,83 83,99 17,99 1,83 1,17";

/** clip-path pro dres uvnitř štítu (v % slotu). */
export const FIFA_RINK_SHIELD_CLIP_CSS =
  "polygon(17% 1%, 83% 1%, 99% 17%, 99% 83%, 83% 99%, 17% 99%, 1% 83%, 1% 17%)";

/** Šířka slotu (% šířky plátna). Štít je čtvercový v pixelech. */
export const FIFA_RINK_SLOT_WIDTH = 12.5;

/**
 * Mobilní šířka slotu (% šířky portrétního plátna).
 * Mírně užší než dřívějších 15 %, ať 8D + náhr. G / 13. F nestíní LB/RB.
 */
export const FIFA_RINK_SLOT_WIDTH_MOBILE = 13.5;
