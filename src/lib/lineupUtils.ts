import type { LineupStructure } from "@/types";
import type { Player } from "@/types";

function cloneLineup(l: LineupStructure): LineupStructure {
  return {
    forwardLines: l.forwardLines.map((x) => ({ ...x })) as LineupStructure["forwardLines"],
    defensePairs: l.defensePairs.map((x) => ({ ...x })) as LineupStructure["defensePairs"],
    goalies: [...l.goalies] as LineupStructure["goalies"],
    extraForwards: [
      l.extraForwards[0] ?? null,
      l.extraForwards[1] ?? null,
      l.extraForwards[2] ?? null,
    ],
    extraDefensemen: [...l.extraDefensemen],
    assistantIds: [...(l.assistantIds ?? [])],
  };
}

/**
 * Starší odkazy / uložené nominace měly 8 beků ve čtyřech párech.
 * Nový model: 7 beků (3× pár + 1 náhradní bek), 4. lajna bez beků, 3 náhradní útočníci.
 */
export function normalizeLineupStructure(lineup: LineupStructure): LineupStructure {
  const next = cloneLineup(lineup);
  const p3 = next.defensePairs[3];
  const mergedD = [...next.extraDefensemen, p3.rb, p3.lb].filter((id): id is string => !!id);
  const seenD = new Set<string>();
  const uniqD: string[] = [];
  for (const id of mergedD) {
    if (!seenD.has(id)) {
      seenD.add(id);
      uniqD.push(id);
    }
  }
  next.defensePairs[3] = { lb: null, rb: null };
  next.extraDefensemen = uniqD.slice(0, 1);

  const rawXf = next.extraForwards as unknown;
  if (
    Array.isArray(rawXf) &&
    rawXf.length <= 3 &&
    rawXf.every((x) => x === null || typeof x === "string")
  ) {
    next.extraForwards = [
      (rawXf[0] as string | null | undefined) ?? null,
      (rawXf[1] as string | null | undefined) ?? null,
      (rawXf[2] as string | null | undefined) ?? null,
    ];
  } else {
    const arr = Array.isArray(rawXf) ? rawXf : [];
    const seenF = new Set<string>();
    const slot: [string | null, string | null, string | null] = [null, null, null];
    let si = 0;
    for (const x of arr) {
      if (typeof x !== "string" || !x || seenF.has(x)) continue;
      seenF.add(x);
      if (si < 3) slot[si++] = x;
    }
    next.extraForwards = slot;
  }

  return next;
}

export function lineupToPlayers(lineup: LineupStructure, players: Player[]): Player[] {
  const ids: string[] = [];
  lineup.forwardLines.forEach((l) => {
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
  });
  lineup.defensePairs.slice(0, 3).forEach((p) => {
    if (p.lb) ids.push(p.lb);
    if (p.rb) ids.push(p.rb);
  });
  lineup.goalies.forEach((g) => g && ids.push(g));
  lineup.extraForwards.forEach((id) => id && ids.push(id));
  lineup.extraDefensemen.forEach((id) => ids.push(id));
  return ids
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
}

export function isLineupComplete(lineup: LineupStructure): boolean {
  const xf = lineup.extraForwards;
  const fCount =
    lineup.forwardLines.reduce((s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0), 0) +
    (xf[0] ? 1 : 0) +
    (xf[1] ? 1 : 0) +
    (xf[2] ? 1 : 0);
  const dInFirstThree = lineup.defensePairs
    .slice(0, 3)
    .reduce((s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0);
  const dCount = dInFirstThree + lineup.extraDefensemen.length;
  const gCount = lineup.goalies.filter(Boolean).length;
  const p3Empty = !lineup.defensePairs[3].lb && !lineup.defensePairs[3].rb;
  return fCount === 15 && dCount === 7 && gCount === 3 && p3Empty;
}
