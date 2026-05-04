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
/** Pro exportní plakát — menší strop písma a případný „řez“ dlouhého jednoslového příjmení na dvě řádky. */
function splitNameplateLinesForPoster(lastName: string): string[] {
  const base = splitNameplateLines(lastName);
  if (base.length !== 1) return base;
  const line = base[0]!;
  const score = nameplateWidthScore(line);
  /** Časněji než na kartě — na úzkém yoku PNG udržet dvě kratší řádky místo jedné ultra dlouhé. */
  if (score <= 11.8 || line.length < 8) return base;
  const mid = Math.ceil(line.length / 2);
  const left = line.slice(0, mid).trimEnd();
  const right = line.slice(mid).trimStart();
  if (left.length < 3 || right.length < 3) return base;
  return [left, right];
}

export function jerseyNameplateNameProps(
  lastName: string,
  variant: "card" | "premium" | "poster" = "card"
): {
  lines: string[];
  className: string;
  style: CSSProperties;
} {
  const s = lastName.trim();
  if (!s) {
    return { lines: [], className: "jersey-nameplate-text text-center", style: {} };
  }

  const linesRaw = variant === "poster" ? splitNameplateLinesForPoster(s) : splitNameplateLines(s);
  const lines = linesRaw;
  if (lines.length === 0) {
    return { lines: [], className: "jersey-nameplate-text text-center leading-tight", style: {} };
  }

  const lineCount = lines.length;
  const score = layoutWidthScore(lines);
  /** Dvě kratší řádky = méně horizontálního stresu → mírně větší písmo než jedna ultraúzká řádka. */
  const multilineEase = lineCount > 1 ? 1.09 : 1;
  /** `premium` = menší potisk, víc „našitý“ do dresu v editoru. `poster` = plakát — vyšší měřítko kvůli čitelnosti exportu. */
  const scale =
    variant === "premium" ? 1.12 : variant === "poster" ? 1.72 : 1.38;

  /** Na exportním PNG je yoke úzký — nižší strop + nižší podlaha, aby dlouhá jména zůstala uvnitř siluety. */
  const minFs =
    variant === "premium"
      ? 3.75 * scale * multilineEase
      : variant === "poster"
        ? 4.28 * scale * multilineEase
        : 4.05 * scale * multilineEase;
  const maxFs =
    variant === "premium"
      ? 10.2 * scale * multilineEase
      : variant === "poster"
        ? 11.65 * scale * multilineEase
        : 11.35 * scale * multilineEase;

  const low = variant === "poster" ? 2.28 : 2.85;
  const high = variant === "poster" ? 15.95 : 21.5;
  const t = clamp((score - low) / (high - low), 0, 1);

  const fontSize = maxFs - t * (maxFs - minFs);
  const baseTrack = lineCount > 1 ? 0.066 : variant === "poster" ? 0.082 : 0.078;
  const letterSpacing =
    baseTrack - t * (lineCount > 1 ? 0.042 : variant === "poster" ? 0.062 : 0.054);
  const lineHeight = lineCount > 1 ? 1.04 + t * 0.04 : 1.08 + t * 0.06;

  const woven =
    variant === "premium" || variant === "poster" ? "jersey-nameplate-text--woven" : "";

  const posterClamp =
    variant === "poster"
      ? "jersey-nameplate-text--poster-crop max-w-[min(100%,7.95rem)] sm:max-w-[min(100%,8.25rem)]"
      : "";

  return {
    lines,
    className: [
      "jersey-nameplate-text",
      woven,
      posterClamp,
      "box-border min-w-0 shrink px-0.5",
      "block w-full max-w-full whitespace-nowrap text-center hyphens-none",
    ]
      .filter(Boolean)
      .join(" "),
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
  variant: "card" | "premium" | "poster" = "card"
): CSSProperties {
  const lines =
    variant === "poster" ? splitNameplateLinesForPoster(lastName.trim()) : splitNameplateLines(lastName.trim());
  const score = layoutWidthScore(lines);
  const longName = score > (lines.length > 1 ? 9.5 : 8.8);

  if (variant === "premium") {
    if (!longName) return {};
    const t = clamp((score - 8.8) / 14, 0, 1);
    const maxPx = lines.length > 1 ? 26.5 : 27.5;
    const minPx = lines.length > 1 ? 22 : 23;
    return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
  }
  if (variant === "poster") {
    if (!longName) return { fontSize: "44px" };
    const t = clamp((score - 9) / 14, 0, 1);
    const maxPx = lines.length > 1 ? 40 : 42;
    const minPx = lines.length > 1 ? 30 : 32;
    return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
  }
  if (!longName) return {};
  const t = clamp((score - 9.2) / 10.5, 0, 1);
  const maxPx = lines.length > 1 ? 24 : 26;
  const minPx = lines.length > 1 ? 17 : 18;
  return { fontSize: `${Math.round((maxPx - t * (maxPx - minPx)) * 10) / 10}px` };
}
