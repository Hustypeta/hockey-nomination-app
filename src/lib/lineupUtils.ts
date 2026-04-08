import type { LineupStructure } from "@/types";
import type { Player } from "@/types";

export function lineupToPlayers(lineup: LineupStructure, players: Player[]): Player[] {
  const ids: string[] = [];
  lineup.forwardLines.forEach((l) => {
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
  });
  lineup.defensePairs.forEach((p) => {
    if (p.lb) ids.push(p.lb);
    if (p.rb) ids.push(p.rb);
  });
  lineup.goalies.forEach((g) => g && ids.push(g));
  lineup.extraForwards.forEach((id) => ids.push(id));
  lineup.extraDefensemen.forEach((id) => ids.push(id));
  return ids
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
}

export function isLineupComplete(lineup: LineupStructure): boolean {
  const fCount =
    lineup.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
    lineup.extraForwards.length;
  const dCount = lineup.defensePairs.reduce(
    (s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0),
    0
  );
  const gCount = lineup.goalies.filter(Boolean).length;
  return fCount === 14 && dCount === 8 && gCount === 3;
}
