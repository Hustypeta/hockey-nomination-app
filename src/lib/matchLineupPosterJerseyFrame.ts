import type { CSSProperties } from "react";

/**
 * Odhad šířky `PremiumJerseySlotCard` při exportu plakátu (Tailwind `lg:w-[128px]`).
 * `scale()` nezvětšuje layout box — obal musí rezervovat výšku, aby se jméno pod dresem nepřekrývalo.
 */
export const MATCH_POSTER_JERSEY_BASE_W_PX = 128;
const ASPECT_H_PER_W = 120 / 100;

export function matchPosterJerseyFrameStyles(
  scale: number,
  /** Rezerva pod dresem (jméno, známka) — `scale()` nezvětšuje layout box. */
  extraBelowJerseyPx = 0
): { shell: CSSProperties; scaler: CSSProperties } {
  const baseH = MATCH_POSTER_JERSEY_BASE_W_PX * ASPECT_H_PER_W;
  const scaledH = baseH * scale;
  return {
    shell: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      width: "100%",
      minHeight: scaledH + 14 + extraBelowJerseyPx,
      boxSizing: "border-box",
    },
    scaler: {
      width: MATCH_POSTER_JERSEY_BASE_W_PX,
      flexShrink: 0,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    },
  };
}
