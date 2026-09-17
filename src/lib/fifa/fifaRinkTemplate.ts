/** Led `/images/fifa-match-rink-ice.png` — 1024×576 (16:9). Sloty v % plátna. */
import {
  FIFA_RINK_SLOT_WIDTH,
  FIFA_RINK_SLOT_WIDTH_MOBILE,
} from "@/lib/fifa/fifaRinkShield";

export const FIFA_RINK_TEMPLATE_SRC = "/images/fifa-match-rink-ice.png";
export const FIFA_RINK_TEMPLATE_WIDTH = 1024;
export const FIFA_RINK_TEMPLATE_HEIGHT = 576;
export const FIFA_RINK_TEMPLATE_ASPECT = FIFA_RINK_TEMPLATE_WIDTH / FIFA_RINK_TEMPLATE_HEIGHT;

/** Mobil — portrétní led (803×1024). */
export const FIFA_RINK_TEMPLATE_MOBILE_SRC = "/images/rink-mobile-lineup.png";
export const FIFA_RINK_TEMPLATE_MOBILE_WIDTH = 803;
export const FIFA_RINK_TEMPLATE_MOBILE_HEIGHT = 1024;
export const FIFA_RINK_TEMPLATE_MOBILE_ASPECT =
  FIFA_RINK_TEMPLATE_MOBILE_WIDTH / FIFA_RINK_TEMPLATE_MOBILE_HEIGHT;

export { FIFA_RINK_SLOT_WIDTH, FIFA_RINK_SLOT_WIDTH_MOBILE };

/** Štít je čtvercový v px → výška v % výšky plátna = šířka% × (16/9). */
export const FIFA_RINK_SLOT_HEIGHT_PCT =
  FIFA_RINK_SLOT_WIDTH * (FIFA_RINK_TEMPLATE_WIDTH / FIFA_RINK_TEMPLATE_HEIGHT);

export type FifaRinkSlotRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function slot(left: number, top: number, width = FIFA_RINK_SLOT_WIDTH): FifaRinkSlotRect {
  return {
    left,
    top,
    width,
    height: width * (FIFA_RINK_TEMPLATE_WIDTH / FIFA_RINK_TEMPLATE_HEIGHT),
  };
}

/** 3-2-1 formace na neořezaném ledě (střed štítu = left/top). */
export const FIFA_RINK_TEMPLATE_SLOTS = {
  lw: slot(30, 21),
  c: slot(50, 21),
  rw: slot(70, 21),
  ld: slot(38, 50),
  rd: slot(62, 50),
  d: slot(50, 50),
  /* Slightly lower G — more room for D nameplates under 12.5% hexes. */
  g: slot(50, 80),
  benchL: slot(13, 50),
  benchR: slot(87, 50),
} as const satisfies Record<string, FifaRinkSlotRect>;

const MOBILE_RATIO = FIFA_RINK_TEMPLATE_MOBILE_WIDTH / FIFA_RINK_TEMPLATE_MOBILE_HEIGHT;

function slotM(left: number, top: number, width = FIFA_RINK_SLOT_WIDTH_MOBILE): FifaRinkSlotRect {
  return { left, top, width, height: width * MOBILE_RATIO };
}

/**
 * Mobil — sloty na portrétním ledě (803×1024).
 * D výš + mírně ke středu; náhr. G / 13. F dál k okrajům u G,
 * ať při 8D + 13. F nepřekrývají LB/RB (vč. jmenovek a bench badge).
 */
export const FIFA_RINK_TEMPLATE_SLOTS_MOBILE = {
  lw:     slotM(24,  23),
  c:      slotM(50,  23),
  rw:     slotM(76,  23),
  ld:     slotM(40,  48),
  rd:     slotM(60,  48),
  d:      slotM(50,  48),
  /* Higher than design 81 so captions survive rotateX + overflow:hidden. */
  g:      slotM(50,  77.5),
  benchL: slotM(11.5, 79),
  benchR: slotM(88.5, 79),
} as const satisfies Record<string, FifaRinkSlotRect>;

export type FifaRinkTemplatePos = keyof typeof FIFA_RINK_TEMPLATE_SLOTS;

/** Střed osmiúhelníku (kotva linek). */
export function fifaRinkSlotLinkAnchor(pos: FifaRinkTemplatePos): { x: number; y: number } {
  const s = FIFA_RINK_TEMPLATE_SLOTS[pos];
  return { x: s.left, y: s.top };
}

export const FIFA_RINK_TEMPLATE_ANCHORS = Object.fromEntries(
  Object.entries(FIFA_RINK_TEMPLATE_SLOTS).map(([k, v]) => [k, { left: v.left, top: v.top }])
) as Record<FifaRinkTemplatePos, { left: number; top: number }>;
