import { resolveMs2026FantasyMatchResult } from "@/lib/ms2026MatchResults";

/** Jedna položka programu MS vrácená z API (`matches` JSON na `MsFantasyGameDay`). */
export type MsFantasyMatchDto = {
  startAt: string;
  home?: string;
  away?: string;
  group?: string;
  phase?: string;
  label?: string;
  homeScore?: number;
  awayScore?: number;
};

export function parseMsFantasyMatches(raw: unknown): MsFantasyMatchDto[] {
  if (!Array.isArray(raw)) return [];
  const out: MsFantasyMatchDto[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.startAt !== "string") continue;
    out.push({
      startAt: o.startAt,
      home: typeof o.home === "string" ? o.home : undefined,
      away: typeof o.away === "string" ? o.away : undefined,
      group: typeof o.group === "string" ? o.group : undefined,
      phase: typeof o.phase === "string" ? o.phase : undefined,
      label: typeof o.label === "string" ? o.label : undefined,
      homeScore: typeof o.homeScore === "number" ? o.homeScore : undefined,
      awayScore: typeof o.awayScore === "number" ? o.awayScore : undefined,
    });
  }
  return out.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function msFantasyMatchFinalScore(m: MsFantasyMatchDto): { homeScore?: number; awayScore?: number } {
  if (typeof m.homeScore === "number" && typeof m.awayScore === "number") {
    return { homeScore: m.homeScore, awayScore: m.awayScore };
  }
  const r = resolveMs2026FantasyMatchResult({ startAt: m.startAt, home: m.home, away: m.away });
  if (!r) return {};
  return { homeScore: r.homeGoals, awayScore: r.awayGoals };
}

export function formatMsFantasyMatchClockPrague(iso: string): string {
  return new Date(iso).toLocaleTimeString("cs-CZ", {
    timeZone: "Europe/Prague",
    hour: "2-digit",
    minute: "2-digit",
  });
}
