import type { LineupStructure } from "@/types";

/** Stejné 4 segmenty jako u exportu hodnocení zápasu (G, D, útok 1–2 / 3–4). */
export type MatchLineupPosterGroup = "goalies" | "defense" | "forwards-12" | "forwards-34";

export const MATCH_LINEUP_POSTER_GROUP_TITLE: Record<MatchLineupPosterGroup, string> = {
  goalies: "Brankáři",
  defense: "Obrana",
  "forwards-12": "Útok – 1. a 2. lajna",
  "forwards-34": "Útok – 3. a 4. lajna",
};

export function pickMatchLineupSegmentPlayerIds(
  lineup: LineupStructure,
  group: MatchLineupPosterGroup,
  defenseCount: 6 | 7 | 8,
  allowExtraForward: boolean
): string[] {
  if (group === "goalies") {
    return [lineup.goalies[0], lineup.goalies[1]].filter(Boolean) as string[];
  }
  if (group === "defense") {
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const p = lineup.defensePairs[i];
      if (p.lb) ids.push(p.lb);
      if (p.rb) ids.push(p.rb);
    }
    if (defenseCount === 8) {
      const p = lineup.defensePairs[3];
      if (p.lb) ids.push(p.lb);
      if (p.rb) ids.push(p.rb);
    } else if (defenseCount === 7) {
      const p = lineup.defensePairs[3];
      if (p.lb) ids.push(p.lb);
    }
    return ids;
  }
  const lineRange = group === "forwards-12" ? [0, 1] : [2, 3];
  const ids: string[] = [];
  for (const li of lineRange) {
    const l = lineup.forwardLines[li];
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
  }
  if (group === "forwards-34" && allowExtraForward && lineup.extraForwards[0]) {
    ids.push(lineup.extraForwards[0]);
  }
  return ids;
}
