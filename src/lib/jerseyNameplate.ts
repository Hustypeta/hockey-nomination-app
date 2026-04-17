import type { CSSProperties } from "react";

/**
 * Odhad „šířky“ příjmení v jedné řádce (délka + širší znaky / diakritika).
 */
export function nameplateWidthScore(lastName: string): number {
  let score = 0;
  for (const ch of lastName.trim()) {
    const c = ch.toUpperCase();
    if ("MWŽŠČŘÝÁÍÉÚŮĎŤŇÓÖÄÜ".includes(c)) score += 1.38;
    else if (c === " ") score += 0.35;
    else score += 1;
  }
  return score;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Jméno na dresu — plynulé zmenšení písma a stažení mezer podle skóre (editor i export).
 * `premium` = širší slot v hlavním editoru (128px), o něco větší rozsah písma.
 */
export function jerseyNameplateNameProps(
  lastName: string,
  variant: "card" | "premium" = "card"
): {
  className: string;
  style: CSSProperties;
} {
  const s = lastName.trim();
  if (!s) {
    return { className: "jersey-nameplate-text text-center leading-tight", style: {} };
  }

  const score = nameplateWidthScore(s);
  /** větší jména na dresu oproti číslu (plakát + editor) */
  const scale = variant === "premium" ? 1.22 : 1.28;
  const minFs = 5.45 * scale;
  const maxFs = 11.05 * scale;
  const low = 3.4;
  const high = 18.2;
  const t = clamp((score - low) / (high - low), 0, 1);

  const fontSize = maxFs - t * (maxFs - minFs);
  const letterSpacing = 0.108 - t * 0.078;
  const lineHeight = 1.03 + t * 0.065;

  const maxWClass = score <= 6 ? "max-w-[90%]" : score <= 11.5 ? "max-w-[92%]" : "max-w-[94%]";

  return {
    className: `jersey-nameplate-text text-center leading-tight ${maxWClass} [overflow-wrap:anywhere]`,
    style: {
      fontSize: `${Math.round(fontSize * 100) / 100}px`,
      letterSpacing: `${Math.round(letterSpacing * 1000) / 1000}em`,
      lineHeight,
    },
  };
}

/**
 * Číslo na dresu — mírně zmenšit při dlouhém příjmení, aby sedělo s potiskem.
 * `premium` = větší sloty v hlavním editoru (PremiumJerseySlotCard).
 */
export function jerseyNumberStyle(
  lastName: string,
  variant: "card" | "premium" = "card"
): CSSProperties {
  const score = nameplateWidthScore(lastName.trim());
  if (variant === "premium") {
    if (score <= 8.5) return {};
    const t = clamp((score - 8.5) / 11, 0, 1);
    const maxPx = 34;
    const minPx = 24;
    return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
  }
  if (score <= 9.5) return {};
  const t = clamp((score - 9.5) / 10, 0, 1);
  const maxPx = 26;
  const minPx = 18;
  return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
}
