import type { LineupStructure } from "@/types";

export type MatchLineupRules = {
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
};

export function countMatchLineup(lineup: LineupStructure, rules: MatchLineupRules) {
  const fBase =
    lineup.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
    (rules.allowExtraForward && lineup.extraForwards[0] ? 1 : 0);

  const dPairsCount = (i: number) =>
    (lineup.defensePairs[i].lb ? 1 : 0) + (lineup.defensePairs[i].rb ? 1 : 0);
  const dBase = dPairsCount(0) + dPairsCount(1) + dPairsCount(2);
  const d4 = dPairsCount(3);
  const dExtra = rules.defenseCount === 8 ? d4 : rules.defenseCount === 7 ? (lineup.defensePairs[3].lb ? 1 : 0) : 0;
  const dCount = dBase + dExtra;

  const gCount = (lineup.goalies[0] ? 1 : 0) + (lineup.goalies[1] ? 1 : 0);

  return { F: fBase, D: dCount, G: gCount };
}

export function isMatchLineupComplete(lineup: LineupStructure, rules: MatchLineupRules): boolean {
  const { F, D, G } = countMatchLineup(lineup, rules);
  const fTarget = 12 + (rules.allowExtraForward ? 1 : 0);
  return F === fTarget && D === rules.defenseCount && G === 2;
}

export function collectMatchLineupIds(lineup: LineupStructure, rules: MatchLineupRules): string[] {
  const ids: string[] = [];
  for (const l of lineup.forwardLines) {
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
  }
  for (let i = 0; i < 3; i++) {
    const p = lineup.defensePairs[i];
    if (p.lb) ids.push(p.lb);
    if (p.rb) ids.push(p.rb);
  }
  if (rules.defenseCount === 8) {
    const p = lineup.defensePairs[3];
    if (p.lb) ids.push(p.lb);
    if (p.rb) ids.push(p.rb);
  } else if (rules.defenseCount === 7) {
    const p = lineup.defensePairs[3];
    if (p.lb) ids.push(p.lb);
  }
  if (lineup.goalies[0]) ids.push(lineup.goalies[0]);
  if (lineup.goalies[1]) ids.push(lineup.goalies[1]);
  if (rules.allowExtraForward && lineup.extraForwards[0]) ids.push(lineup.extraForwards[0]);
  return ids;
}

