/**
 * Konečné výsledky zápasů MS 2026 (zobrazení u /zapasy a v programu fantasy).
 * Čísla odpovídají pořadí home / away v harmonogramu (IIHF).
 */
export type Ms2026MatchResult = {
  headline: string;
  homeGoals: number;
  awayGoals: number;
};

export function resolveMs2026MatchResult(opts: {
  category?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
}): Ms2026MatchResult | undefined {
  if (opts.category !== "ms2026") return undefined;

  const h = (opts.homeCode ?? "").trim().toUpperCase();
  const a = (opts.awayCode ?? "").trim().toUpperCase();

  if (h === "CZE" && a === "DEN") {
    return { headline: "CZE:DEN 4:1", homeGoals: 4, awayGoals: 1 };
  }

  return undefined;
}

/** Výsledek podle startAt + týmů (fantasy program bez DB zápasu). */
export function resolveMs2026FantasyMatchResult(opts: {
  startAt: string;
  home?: string;
  away?: string;
}): Ms2026MatchResult | undefined {
  const h = (opts.home ?? "").trim().toUpperCase();
  const a = (opts.away ?? "").trim().toUpperCase();
  if (h === "CZE" && a === "DEN" && opts.startAt === "2026-05-15T18:20:00.000Z") {
    return { headline: "CZE:DEN 4:1", homeGoals: 4, awayGoals: 1 };
  }
  return undefined;
}
