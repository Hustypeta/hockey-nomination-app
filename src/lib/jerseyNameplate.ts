import type { CSSProperties } from "react";

/**
 * Odhad „šířky“ příjmení v jedné řádce (délka + širší znaky / diakritika).
 */
export function nameplateWidthScore(lastName: string): number {
  let score = 0;
  for (const ch of lastName.trim()) {
    const c = ch.toUpperCase();
    if (c === ".") score += 0.55;
    else if ("MWŽŠČŘÝÁÍÉÚŮĎŤŇÓÖÄÜ".includes(c)) score += 1.38;
    else if (c === " ") score += 0.35;
    else score += 1;
  }
  return score;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** „M. Kovařčík“ — iniciála + příjmení, vždy jedna řádka (ne dělit po mezeře). */
function isInitialPlusSurname(raw: string): boolean {
  return /^[\p{L}]\.\s+\S+/u.test(raw.trim());
}

/**
 * Dvouřádkový potisk jen tam, kde je to v příjmeních běžné (pomlčka, mezera).
 * Bez „useknutí“ uprostřed jednoho slova — tam řeší šířku jen zmenšení písma.
 */
export function splitNameplateLines(lastName: string): string[] {
  const raw = lastName.trim();
  if (!raw) return [];
  if (isInitialPlusSurname(raw)) return [raw];
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
 * Plakát — jen přirozené zlomy (pomlčka / mezera). Žádný řez uprostřed slova
 * (VOŽENÍLEK, MELOVSKÝ musí zůstat celé).
 */
function splitNameplateLinesForPoster(lastName: string): string[] {
  return splitNameplateLines(lastName);
}

export type JerseyNameplateOptions = {
  /** Stejná velikost pro všechna jména; zmenší jen při riziku přesahu. */
  uniformPosterSize?: boolean;
  uniformFontPx?: number;
  /** Extra šířka za C / A vedle příjmení — zmenšit jen když by řádek srazil souseda. */
  leadershipExtraScore?: number;
};

export function jerseyNameplateNameProps(
  lastName: string,
  variant: "card" | "premium" | "poster" | "rink" = "card",
  options?: JerseyNameplateOptions
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

  if (variant === "poster" && options?.uniformPosterSize) {
    const uniformPx = options.uniformFontPx ?? 18;
    const overflowScore = 11.8;
    const minPx = 16;
    const fitScore = score + Math.max(0, options.leadershipExtraScore ?? 0);
    let fontSize = uniformPx;
    if (fitScore > overflowScore) {
      const t = clamp((fitScore - overflowScore) / (16.5 - overflowScore), 0, 1);
      fontSize = uniformPx - t * (uniformPx - minPx);
    }
    const woven = "jersey-nameplate-text--woven";
    const posterClamp = "jersey-nameplate-text--poster-crop";
    return {
      lines,
      className: [
        "jersey-nameplate-text",
        woven,
        posterClamp,
        "box-border w-max max-w-none overflow-visible px-px",
        "block whitespace-nowrap text-center hyphens-none",
      ].join(" "),
      style: {
        fontSize: `${Math.round(fontSize * 100) / 100}px`,
        letterSpacing: fitScore > overflowScore ? "0.015em" : "0.03em",
        lineHeight: lineCount > 1 ? 1.12 : 1.18,
      },
    };
  }

  /** Dvě kratší řádky = méně horizontálního stresu → mírně větší písmo než jedna ultraúzká řádka. */
  const multilineEase = lineCount > 1 ? 1.09 : 1;
  /** `premium` = menší potisk, víc „našitý“ do dresu v editoru. `poster` = plakát. `rink` = šablona ledu (cqh). */
  const scale =
    variant === "premium" ? 1.12 : variant === "poster" ? 1.72 : variant === "rink" ? 1.38 : 1.24;

  /** Na exportním PNG je yoke úzký — nižší strop + nižší podlaha, aby dlouhá jména zůstala uvnitř siluety. */
  const minFs =
    variant === "premium"
      ? 3.75 * scale * multilineEase
      : variant === "poster"
        ? 4.28 * scale * multilineEase
        : variant === "rink"
          ? 5.5 * scale * multilineEase
          : 4.05 * scale * multilineEase;
  const maxFs =
    variant === "premium"
      ? 10.2 * scale * multilineEase
      : variant === "poster"
        ? 11.65 * scale * multilineEase
        : variant === "rink"
          ? 15.5 * scale * multilineEase
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
    variant === "poster" ? "jersey-nameplate-text--poster-crop w-max max-w-none overflow-visible" : "";

  return {
    lines,
    className: [
      "jersey-nameplate-text",
      woven,
      posterClamp,
      variant === "poster"
        ? "box-border w-max max-w-none overflow-visible px-0.5"
        : "box-border min-w-0 shrink px-0.5",
      variant === "poster"
        ? "block whitespace-nowrap text-center hyphens-none"
        : "block w-full max-w-full whitespace-nowrap text-center hyphens-none",
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
  variant: "card" | "premium" | "poster" | "rink" = "card"
): CSSProperties {
  if (variant === "rink") return {};
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
