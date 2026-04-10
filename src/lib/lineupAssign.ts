import type { LineupStructure } from "@/types";
import type { Player } from "@/types";
import { POSITION_LIMITS } from "@/types";

function cloneLineup(l: LineupStructure): LineupStructure {
  return {
    forwardLines: l.forwardLines.map((x) => ({ ...x })) as LineupStructure["forwardLines"],
    defensePairs: l.defensePairs.map((x) => ({ ...x })) as LineupStructure["defensePairs"],
    goalies: [...l.goalies] as LineupStructure["goalies"],
    extraForwards: [...l.extraForwards],
    extraDefensemen: [...l.extraDefensemen],
    assistantIds: [...(l.assistantIds ?? [])],
  };
}

export function lineupPlayerIds(lineup: LineupStructure): Set<string> {
  const s = new Set<string>();
  lineup.goalies.forEach((g) => g && s.add(g));
  lineup.forwardLines.forEach((l) => {
    if (l.lw) s.add(l.lw);
    if (l.c) s.add(l.c);
    if (l.rw) s.add(l.rw);
  });
  lineup.defensePairs.forEach((p) => {
    if (p.lb) s.add(p.lb);
    if (p.rb) s.add(p.rb);
  });
  lineup.extraForwards.forEach((id) => s.add(id));
  lineup.extraDefensemen.forEach((id) => s.add(id));
  return s;
}

export function positionCounts(lineup: LineupStructure) {
  return {
    G: lineup.goalies.filter(Boolean).length,
    D:
      lineup.defensePairs.reduce((n, p) => n + (p.lb ? 1 : 0) + (p.rb ? 1 : 0), 0) +
      lineup.extraDefensemen.length,
    F:
      lineup.forwardLines.reduce(
        (n, l) => n + (l.lw ? 1 : 0) + (l.c ? 1 : 0) + (l.rw ? 1 : 0),
        0
      ) + lineup.extraForwards.length,
  };
}

function stripPlayerFromLineup(lineup: LineupStructure, playerId: string): LineupStructure {
  const next = cloneLineup(lineup);
  next.goalies = next.goalies.map((g) => (g === playerId ? null : g)) as LineupStructure["goalies"];
  next.forwardLines = next.forwardLines.map((l) => ({
    lw: l.lw === playerId ? null : l.lw,
    c: l.c === playerId ? null : l.c,
    rw: l.rw === playerId ? null : l.rw,
  })) as LineupStructure["forwardLines"];
  next.defensePairs = next.defensePairs.map((p) => ({
    lb: p.lb === playerId ? null : p.lb,
    rb: p.rb === playerId ? null : p.rb,
  })) as LineupStructure["defensePairs"];
  next.extraForwards = next.extraForwards.filter((id) => id !== playerId);
  next.extraDefensemen = next.extraDefensemen.filter((id) => id !== playerId);
  next.assistantIds = (next.assistantIds ?? []).filter((id) => id !== playerId);
  return next;
}

export function removePlayerFromLineup(lineup: LineupStructure, playerId: string): LineupStructure {
  return stripPlayerFromLineup(lineup, playerId);
}

/** První volný slot pro pozici (klik z poolu bez výběru slotu). */
export function tryAutoAssignPlayer(lineup: LineupStructure, player: Player): LineupStructure | null {
  const used = lineupPlayerIds(lineup);
  if (used.has(player.id)) return null;
  const counts = positionCounts(lineup);
  const lim = POSITION_LIMITS[player.position];
  if (counts[player.position] >= lim) return null;

  const next = cloneLineup(lineup);

  if (player.position === "G") {
    const i = next.goalies.findIndex((g) => g === null);
    if (i === -1) return null;
    next.goalies[i] = player.id;
    return next;
  }

  if (player.position === "D") {
    for (let p = 0; p < next.defensePairs.length; p++) {
      const pair = next.defensePairs[p];
      if (!pair.lb) {
        next.defensePairs[p] = { ...pair, lb: player.id };
        return next;
      }
      if (!pair.rb) {
        next.defensePairs[p] = { ...pair, rb: player.id };
        return next;
      }
    }
    return null;
  }

  for (let li = 0; li < next.forwardLines.length; li++) {
    const line = next.forwardLines[li];
    if (!line.lw) {
      next.forwardLines[li] = { ...line, lw: player.id };
      return next;
    }
    if (!line.c) {
      next.forwardLines[li] = { ...line, c: player.id };
      return next;
    }
    if (!line.rw) {
      next.forwardLines[li] = { ...line, rw: player.id };
      return next;
    }
  }
  if (next.extraForwards.length < 2) {
    next.extraForwards = [...next.extraForwards, player.id];
    return next;
  }
  return null;
}

export type DropTarget =
  | { type: "goalie"; index: number }
  | { type: "forward"; lineIndex: number; role: "lw" | "c" | "rw" }
  | { type: "defense"; pairIndex: number; role: "lb" | "rb" }
  | { type: "extraForward"; slotIndex: 0 | 1 };

/** Přiřadí hráče na konkrétní slot (DnD). Odstraní ho z předchozího místa v sestavě. */
export function assignPlayerToTarget(
  lineup: LineupStructure,
  player: Player,
  target: DropTarget
): LineupStructure | null {
  const used = lineupPlayerIds(lineup);
  let next = used.has(player.id) ? stripPlayerFromLineup(lineup, player.id) : cloneLineup(lineup);

  if (target.type === "goalie") {
    if (player.position !== "G") return null;
    const i = target.index;
    if (i < 0 || i > 2) return null;
    next.goalies = [...next.goalies] as LineupStructure["goalies"];
    next.goalies[i] = player.id;
    return next;
  }

  if (target.type === "defense") {
    if (player.position !== "D") return null;
    const p = target.pairIndex;
    if (p < 0 || p > 3) return null;
    const pair = { ...next.defensePairs[p] };
    if (target.role === "lb") pair.lb = player.id;
    else pair.rb = player.id;
    next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
    next.defensePairs[p] = pair;
    return next;
  }

  if (target.type === "forward") {
    if (player.position !== "F") return null;
    const li = target.lineIndex;
    if (li < 0 || li > 3) return null;
    const line = { ...next.forwardLines[li] };
    line[target.role] = player.id;
    next.forwardLines = [...next.forwardLines] as LineupStructure["forwardLines"];
    next.forwardLines[li] = line;
    return next;
  }

  if (player.position !== "F") return null;
  const others = next.extraForwards.filter((id) => id !== player.id);
  if (target.slotIndex === 0) {
    next.extraForwards = [player.id, ...(others[0] ? [others[0]] : [])].slice(0, 2);
  } else {
    next.extraForwards = [...(others[0] ? [others[0]] : []), player.id].slice(0, 2);
  }
  return next;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRandomLineup(players: Player[]): LineupStructure | null {
  const gs = shuffle(players.filter((p) => p.position === "G"));
  const ds = shuffle(players.filter((p) => p.position === "D"));
  const fs = shuffle(players.filter((p) => p.position === "F"));
  if (gs.length < 3 || ds.length < 8 || fs.length < 14) return null;

  let fi = 0;
  const forwardLines = [0, 1, 2, 3].map(() => {
    const lw = fs[fi++].id;
    const c = fs[fi++].id;
    const rw = fs[fi++].id;
    return { lw, c, rw };
  }) as LineupStructure["forwardLines"];

  let di = 0;
  const defensePairs = [0, 1, 2, 3].map(() => {
    const lb = ds[di++].id;
    const rb = ds[di++].id;
    return { lb, rb };
  }) as LineupStructure["defensePairs"];

  const goalies: LineupStructure["goalies"] = [gs[0].id, gs[1].id, gs[2].id];
  const extraForwards = [fs[fi].id, fs[fi + 1].id];

  return {
    forwardLines,
    defensePairs,
    goalies,
    extraForwards,
    extraDefensemen: [],
    assistantIds: [],
  };
}

export function clearPositionGroup(
  lineup: LineupStructure,
  pos: "G" | "D" | "F"
): LineupStructure {
  const next = cloneLineup(lineup);
  if (pos === "G") next.goalies = [null, null, null];
  if (pos === "D") {
    next.defensePairs = [
      { lb: null, rb: null },
      { lb: null, rb: null },
      { lb: null, rb: null },
      { lb: null, rb: null },
    ] as LineupStructure["defensePairs"];
    next.extraDefensemen = [];
  }
  if (pos === "F") {
    next.forwardLines = [
      { lw: null, c: null, rw: null },
      { lw: null, c: null, rw: null },
      { lw: null, c: null, rw: null },
      { lw: null, c: null, rw: null },
    ] as LineupStructure["forwardLines"];
    next.extraForwards = [];
  }
  const used = lineupPlayerIds(next);
  next.assistantIds = (next.assistantIds ?? []).filter((id) => used.has(id));
  return next;
}
