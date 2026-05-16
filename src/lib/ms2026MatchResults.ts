/**
 * Konečné výsledky zápasů MS 2026 (zobrazení u /zapasy a v programu fantasy).
 * Čísla odpovídají pořadí home / away v harmonogramu (IIHF).
 * Kanonická data: {@link MS2026_FANTASY_OFFICIAL_GAME_DAYS} (`homeScore` / `awayScore`).
 */
import { MS2026_FANTASY_OFFICIAL_GAME_DAYS } from "@/lib/ms2026FantasyOfficialGameDays";

export type Ms2026MatchResult = {
  headline: string;
  homeGoals: number;
  awayGoals: number;
};

function fmtHeadline(home: string, away: string, homeGoals: number, awayGoals: number): string {
  return `${home}:${away} ${homeGoals}:${awayGoals}`;
}

function buildIndexes() {
  const byTeams = new Map<string, Ms2026MatchResult>();
  const byStartTeams = new Map<string, Ms2026MatchResult>();

  for (const day of MS2026_FANTASY_OFFICIAL_GAME_DAYS) {
    for (const m of day.matches) {
      if (typeof m.homeScore !== "number" || typeof m.awayScore !== "number") continue;
      const home = (m.home ?? "").trim().toUpperCase();
      const away = (m.away ?? "").trim().toUpperCase();
      if (!home || !away) continue;

      const result: Ms2026MatchResult = {
        headline: fmtHeadline(home, away, m.homeScore, m.awayScore),
        homeGoals: m.homeScore,
        awayGoals: m.awayScore,
      };

      byTeams.set(`${home}|${away}`, result);
      byStartTeams.set(`${m.startAt}|${home}|${away}`, result);
    }
  }

  return { byTeams, byStartTeams };
}

const { byTeams, byStartTeams } = buildIndexes();

export function resolveMs2026MatchResult(opts: {
  category?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
}): Ms2026MatchResult | undefined {
  if (opts.category !== "ms2026") return undefined;

  const h = (opts.homeCode ?? "").trim().toUpperCase();
  const a = (opts.awayCode ?? "").trim().toUpperCase();
  if (!h || !a) return undefined;

  return byTeams.get(`${h}|${a}`);
}

/** Výsledek podle startAt + týmů (fantasy program bez DB zápasu). */
export function resolveMs2026FantasyMatchResult(opts: {
  startAt: string;
  home?: string;
  away?: string;
}): Ms2026MatchResult | undefined {
  const h = (opts.home ?? "").trim().toUpperCase();
  const a = (opts.away ?? "").trim().toUpperCase();
  if (!h || !a) return undefined;

  return byStartTeams.get(`${opts.startAt}|${h}|${a}`);
}
