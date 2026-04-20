import type { LineupStructure } from "@/types";
import type { Player } from "@/types";

type ForwardLineLike = {
  lw: string | null;
  c: string | null;
  rw: string | null;
  x?: string | null;
};

function cloneLineup(l: LineupStructure): LineupStructure {
  return {
    forwardLines: l.forwardLines.map((row) => {
      const x = row as ForwardLineLike;
      return {
        lw: x.lw,
        c: x.c,
        rw: x.rw,
        x: x.x ?? null,
      };
    }) as LineupStructure["forwardLines"],
    defensePairs: l.defensePairs.map((x) => ({ ...x })) as LineupStructure["defensePairs"],
    goalies: [...l.goalies] as LineupStructure["goalies"],
    extraForwards: [l.extraForwards[0] ?? null] as LineupStructure["extraForwards"],
    extraDefensemen: [...(l.extraDefensemen ?? [])].slice(0, 1),
    assistantIds: [...(l.assistantIds ?? [])],
  };
}

/**
 * Migrace starých nominací: druhý náhradní útočník → doplnění 4. lajny (x / RW / C / LW), jinak sloučení do jednoho slotu.
 * Dříve 3 náhradní útočníci → třetí do 4. lajny (slot x).
 * Staré nominace: bek jen v náhradnících bez sedmého v řádku → přesune do defensePairs[3].lb. U 4. páru vždy RB = null.
 */
export function normalizeLineupStructure(lineup: LineupStructure): LineupStructure {
  const next = cloneLineup(lineup);

  for (let i = 0; i < 3; i++) {
    const line = next.forwardLines[i];
    if (line.x) {
      const orphan = line.x;
      const l4 = next.forwardLines[3];
      if (!l4.x) next.forwardLines[3] = { ...l4, x: orphan };
      else if (!l4.rw) next.forwardLines[3] = { ...l4, rw: orphan };
      else if (!l4.c) next.forwardLines[3] = { ...l4, c: orphan };
      else if (!l4.lw) next.forwardLines[3] = { ...l4, lw: orphan };
      next.forwardLines[i] = { ...line, x: null };
    }
  }

  const rawXf = next.extraForwards as unknown;
  let a: string | null = null;
  let b: string | null = null;
  if (Array.isArray(rawXf)) {
    a = (rawXf[0] as string | null | undefined) ?? null;
    b = (rawXf[1] as string | null | undefined) ?? null;
    const c = (rawXf[2] as string | null | undefined) ?? null;
    if (c) {
      const l4 = next.forwardLines[3];
      if (!l4.x) next.forwardLines[3] = { ...l4, x: c };
      else if (!l4.rw) next.forwardLines[3] = { ...l4, rw: c };
      else if (!l4.c) next.forwardLines[3] = { ...l4, c: c };
      else if (!l4.lw) next.forwardLines[3] = { ...l4, lw: c };
    }
  }
  if (b) {
    const l4 = next.forwardLines[3];
    if (!l4.x) next.forwardLines[3] = { ...l4, x: b };
    else if (!l4.rw) next.forwardLines[3] = { ...l4, rw: b };
    else if (!l4.c) next.forwardLines[3] = { ...l4, c: b };
    else if (!l4.lw) next.forwardLines[3] = { ...l4, lw: b };
    else if (!a) a = b;
  }
  next.extraForwards = [a];

  const p3 = next.defensePairs[3];
  const lb = p3.lb ?? p3.rb ?? null;
  next.defensePairs[3] = { lb, rb: null };

  if (next.extraDefensemen[0] && !next.defensePairs[3].lb) {
    next.defensePairs[3] = { lb: next.extraDefensemen[0], rb: null };
    next.extraDefensemen = [];
  }

  return next;
}

export function lineupToPlayers(lineup: LineupStructure, players: Player[]): Player[] {
  const ids: string[] = [];
  lineup.forwardLines.forEach((l) => {
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
    if (l.x) ids.push(l.x);
  });
  lineup.defensePairs.forEach((p) => {
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
    lineup.forwardLines.reduce(
      (s, l) => s + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0) + (l.x ? 1 : 0),
      0
    ) + (xf[0] ? 1 : 0);
  const dInFirstThree = lineup.defensePairs
    .slice(0, 3)
    .reduce((s, p) => s + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0);
  const p3 = lineup.defensePairs[3];
  const seventhInRow = p3.lb ? 1 : 0;
  const seventhExtra = lineup.extraDefensemen[0] ? 1 : 0;
  const dCount = dInFirstThree + seventhInRow + seventhExtra;
  const gCount = lineup.goalies.filter(Boolean).length;
  const p3RbEmpty = !p3.rb;
  return fCount === 14 && dCount === 8 && gCount === 3 && p3RbEmpty;
}

/** Všichni hráči z rozestavení (pro ověření C / A). */
export function collectLineupPlayerIds(lineup: LineupStructure): Set<string> {
  const ids = new Set<string>();
  for (const l of lineup.forwardLines) {
    if (l.lw) ids.add(l.lw);
    if (l.c) ids.add(l.c);
    if (l.rw) ids.add(l.rw);
    if (l.x) ids.add(l.x);
  }
  for (const p of lineup.defensePairs) {
    if (p.lb) ids.add(p.lb);
    if (p.rb) ids.add(p.rb);
  }
  for (const g of lineup.goalies) {
    if (g) ids.add(g);
  }
  if (lineup.extraForwards[0]) ids.add(lineup.extraForwards[0]);
  for (const d of lineup.extraDefensemen) {
    if (d) ids.add(d);
  }
  return ids;
}

/** Jeden kapitán a přesně dva asistenti (jako v editoru — max. 2× A). */
export function isLeadershipComplete(lineup: LineupStructure, captainId: string | null): boolean {
  if (!captainId) return false;
  const roster = collectLineupPlayerIds(lineup);
  if (!roster.has(captainId)) return false;
  const raw = lineup.assistantIds ?? [];
  const asst = [...new Set(raw.filter(Boolean))];
  if (asst.length !== 2) return false;
  for (const a of asst) {
    if (a === captainId) return false;
    if (!roster.has(a)) return false;
  }
  return true;
}
