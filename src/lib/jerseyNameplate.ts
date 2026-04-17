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
 * Dvouřádkový potisk jen tam, kde je to v příjmeních běžné (pomlčka, mezera).
 * Bez „useknutí“ uprostřed jednoho slova — tam řeší šířku jen zmenšení písma.
 */
export function splitNameplateLines(lastName: string): string[] {
  const raw = lastName.trim();
  if (!raw) return [];
  const hyphen = raw.indexOf("-");
  if (hyphen > 0 && hyphen < raw.length - 1) {
    return [raw.slice(0, hyphen), raw.slice(hyphen + 1)]
      .map((p) => p.trim())
      .filter(Boolean);
  }
  const space = raw.indexOf(" ");
  if (space > 0) {
    return [raw.slice(0, space), raw.slice(space + 1)]
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [raw];
}

function layoutWidthScore(lines: string[]): number {
  if (lines.length === 0) return 0;
  return Math.max(...lines.map((l) => nameplateWidthScore(l)));
}

/**
 * Jméno na dresu — plynulé zmenšení písma a mezer podle šířky (editor, karty, export).
 * `premium` = širší slot v hlavním editoru.
 * Dlouhá jednoslovná jména zůstaní na jednom řádku s menším písmem (čitelné na sdílených PNG).
 */
export function jerseyNameplateNameProps(
  lastName: string,
  variant: "card" | "premium" = "card"
): {
  lines: string[];
  className: string;
  style: CSSProperties;
} {
  const s = lastName.trim();
  if (!s) {
    return { lines: [], className: "jersey-nameplate-text text-center", style: {} };
  }

  const lines = splitNameplateLines(s);
  if (lines.length === 0) {
    return { lines: [], className: "jersey-nameplate-text text-center leading-tight", style: {} };
  }

  const lineCount = lines.length;
  const score = layoutWidthScore(lines);
  /** Dvě kratší řádky = méně horizontálního stresu → mírně větší písmo než jedna ultraúzká řádka. */
  const multilineEase = lineCount > 1 ? 1.09 : 1;
  const scale = variant === "premium" ? 1.2 : 1.24;

  const minFs = (variant === "premium" ? 4.35 : 4.05) * scale * multilineEase;
  const maxFs = (variant === "premium" ? 12.6 : 11.35) * scale * multilineEase;

  const low = 2.85;
  const high = 21.5;
  const t = clamp((score - low) / (high - low), 0, 1);

  const fontSize = maxFs - t * (maxFs - minFs);
  const baseTrack = lineCount > 1 ? 0.072 : 0.098;
  const letterSpacing = baseTrack - t * (lineCount > 1 ? 0.048 : 0.068);
  const lineHeight = lineCount > 1 ? 1.0 + t * 0.04 : 1.02 + t * 0.06;

  return {
    lines,
    className:
      "jersey-nameplate-text block w-full max-w-full px-0.5 text-center [overflow-wrap:anywhere] hyphens-none",
    style: {
      fontSize: `${Math.round(fontSize * 100) / 100}px`,
      letterSpacing: `${Math.round(letterSpacing * 1000) / 1000}em`,
      lineHeight,
    },
  };
}

/**
 * Číslo na dresu — mírně zmenšit při dlouhém příjmení, aby sedělo s potiskem.
 * `premium` = větší sloty v hlavním editoru (`PremiumJerseySlotCard`).
 */
export function jerseyNumberStyle(
  lastName: string,
  variant: "card" | "premium" = "card"
): CSSProperties {
  const lines = splitNameplateLines(lastName.trim());
  const score = layoutWidthScore(lines);
  const longName = score > (lines.length > 1 ? 9.5 : 8.8);

  if (variant === "premium") {
    if (!longName) return {};
    const t = clamp((score - 8.8) / 12, 0, 1);
    const maxPx = lines.length > 1 ? 32 : 34;
    const minPx = lines.length > 1 ? 22 : 24;
    return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
  }
  if (!longName) return {};
  const t = clamp((score - 9.2) / 10.5, 0, 1);
  const maxPx = lines.length > 1 ? 24 : 26;
  const minPx = lines.length > 1 ? 17 : 18;
  return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
}
