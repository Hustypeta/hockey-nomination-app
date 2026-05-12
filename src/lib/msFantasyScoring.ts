import type { MsFantasySkaterBox, MsFantasyGoalieBox } from "./msFantasyConfig";
import { MS_FANTASY_POINTS } from "./msFantasyConfig";

export function skaterFantasyPoints(box: MsFantasySkaterBox): number {
  const p = MS_FANTASY_POINTS.skater;
  return box.goals * p.goal + box.assists * p.assist + box.plusMinus * p.plusMinus;
}

export function goalieFantasyPoints(box: MsFantasyGoalieBox): number {
  const p = MS_FANTASY_POINTS.goalie;
  return box.wins * p.win + box.goalsAgainst * p.goalAgainst + box.shutouts * p.shutout;
}

/** Součet bodů pro řádek nominace (podle pozice G vs bruslař). */
export function lineupDayPoints(
  picks: Array<{ position: string; skater?: MsFantasySkaterBox | null; goalie?: MsFantasyGoalieBox | null }>
): number {
  let total = 0;
  for (const row of picks) {
    const isGk = row.position === "G";
    if (isGk && row.goalie) total += goalieFantasyPoints(row.goalie);
    if (!isGk && row.skater) total += skaterFantasyPoints(row.skater);
  }
  return total;
}
