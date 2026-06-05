import type { MsFantasyGoalieBox, MsFantasySkaterBox } from "@/lib/msFantasyConfig";
import { goalieFantasyPoints, skaterFantasyPoints } from "@/lib/msFantasyScoring";
import type { FantasyAdminStatInput } from "@/lib/msFantasyAdminTypes";

function clampInt(v: unknown, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Náhled bodů ve formuláři admin UI — bez DB. */
export function statRowToFantasyPoints(position: string, row: FantasyAdminStatInput): number {
  const isGk = position === "G";
  if (isGk) {
    const box: MsFantasyGoalieBox = {
      wins: clampInt(row.wins, 0, 9),
      goalsAgainst: clampInt(row.goalsAgainst, 0, 99),
      shutouts: clampInt(row.shutouts, 0, 9),
    };
    return goalieFantasyPoints(box);
  }
  const box: MsFantasySkaterBox = {
    goals: clampInt(row.goals, 0, 99),
    assists: clampInt(row.assists, 0, 99),
    plusMinus: clampInt(row.plusMinus, -99, 99),
  };
  return skaterFantasyPoints(box);
}

export function clampFantasyStatInt(v: unknown, min: number, max: number): number {
  return clampInt(v, min, max);
}
