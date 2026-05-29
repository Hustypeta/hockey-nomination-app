import type { LineupStructure } from "@/types";

/** Segmenty řezů grafiky: kompletní lajny (3F + 2D; 1. lajna + 1. gólman, 4. lajna + 13. útočník + 2. gólman). Dále skupiny G / D / útok pro „jen jména“. */
export type MatchLineupPosterGroup =
  | "goalies"
  | "defense"
  | "forwards-12"
  | "forwards-34"
  | "line-1"
  | "line-2"
  | "line-3"
  | "line-4";

export const MATCH_LINEUP_POSTER_GROUP_TITLE: Record<MatchLineupPosterGroup, string> = {
  goalies: "Brankáři",
  defense: "Obrana",
  "forwards-12": "Útok – 1. a 2. lajna",
  "forwards-34": "Útok – 3. a 4. lajna",
  "line-1": "1. lajna",
  "line-2": "2. lajna",
  "line-3": "3. lajna",
  "line-4": "4. lajna",
};

export type MatchLineupLinePosterGroup = "line-1" | "line-2" | "line-3" | "line-4";

export function isMatchLineupLinePosterGroup(
  group: MatchLineupPosterGroup
): group is MatchLineupLinePosterGroup {
  return group === "line-1" || group === "line-2" || group === "line-3" || group === "line-4";
}

/**
 * Pořadí z `pickMatchLineupSegmentPlayerIds` u line-*: 3× F, 2× D, spodek jen 1. gólman (1. lajna).
 * Extra hráči (13. útočník, 2. gólman) viz `pickMatchLineupLineExtraSlots`.
 */
export function splitMatchLineupLinePosterChunks(
  ids: string[],
  group: MatchLineupPosterGroup
): { forwards: string[]; defense: string[]; bottom: string[] } | null {
  if (!isMatchLineupLinePosterGroup(group)) return null;
  return {
    forwards: ids.slice(0, 3),
    defense: ids.slice(3, 5),
    bottom: ids.slice(5),
  };
}

export function pickMatchLineupSegmentPlayerIds(
  lineup: LineupStructure,
  group: MatchLineupPosterGroup,
  defenseCount: 6 | 7 | 8,
  allowExtraForward: boolean
): string[] {
  if (group === "line-1" || group === "line-2" || group === "line-3" || group === "line-4") {
    const lineIdx = group === "line-1" ? 0 : group === "line-2" ? 1 : group === "line-3" ? 2 : 3;

    const ids: string[] = [];

    // 3× útočník z dané lajny
    const f = lineup.forwardLines[lineIdx];
    if (f?.lw) ids.push(f.lw);
    if (f?.c) ids.push(f.c);
    if (f?.rw) ids.push(f.rw);

    // 2× obránce (pár odpovídající lajně; když chybí, použij poslední dostupný pár)
    const maxPairIdx = defenseCount === 8 ? 3 : defenseCount === 7 ? 3 : 2;
    const dIdx = Math.min(lineIdx, maxPairIdx);
    const d = lineup.defensePairs[dIdx];
    if (d?.lb) ids.push(d.lb);
    if (d?.rb) ids.push(d.rb);

    // Speciální pravidla:
    // - 1. obrázek: přidat 1. gólmana
    // - 4. obrázek: přidat 2. gólmana + 13. útočníka (pokud povolen)
    if (group === "line-1" && lineup.goalies[0]) ids.push(lineup.goalies[0]);

    return ids;
  }
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
  return ids;
}

export const MATCH_LINEUP_EXTRA_FORWARD_LABEL = "13. útočník";
export const MATCH_LINEUP_SECOND_GOALIE_LABEL = "2. gólman";

export type MatchLineupLineExtraSlot = {
  playerId: string;
  label: string;
  kind: "extra-forward" | "second-goalie";
};

/** Extra hráči mimo hlavní 3F+2D+G grid — jen u 4. lajny (export po lajnách). */
export function pickMatchLineupLineExtraSlots(
  lineup: LineupStructure,
  group: MatchLineupPosterGroup,
  allowExtraForward: boolean
): MatchLineupLineExtraSlot[] {
  if (group !== "line-4") return [];
  const out: MatchLineupLineExtraSlot[] = [];
  if (allowExtraForward && lineup.extraForwards[0]) {
    out.push({
      playerId: lineup.extraForwards[0],
      label: MATCH_LINEUP_EXTRA_FORWARD_LABEL,
      kind: "extra-forward",
    });
  }
  if (lineup.goalies[1]) {
    out.push({
      playerId: lineup.goalies[1],
      label: MATCH_LINEUP_SECOND_GOALIE_LABEL,
      kind: "second-goalie",
    });
  }
  return out;
}

/** 13. útočník pro segment „útok 3.+4. lajna“ — mimo hlavní grid. */
export function pickMatchLineupForwards34ExtraSlot(
  lineup: LineupStructure,
  group: MatchLineupPosterGroup,
  allowExtraForward: boolean
): MatchLineupLineExtraSlot | null {
  if (group !== "forwards-34" || !allowExtraForward || !lineup.extraForwards[0]) return null;
  return {
    playerId: lineup.extraForwards[0],
    label: MATCH_LINEUP_EXTRA_FORWARD_LABEL,
    kind: "extra-forward",
  };
}

/** Celá soupiska s dresy: doplňkoví hráči mimo hlavní sekce. */
export function pickMatchLineupFullPosterExtraSlots(
  lineup: LineupStructure,
  allowExtraForward: boolean
): MatchLineupLineExtraSlot[] {
  const out: MatchLineupLineExtraSlot[] = [];
  if (allowExtraForward && lineup.extraForwards[0]) {
    out.push({
      playerId: lineup.extraForwards[0],
      label: MATCH_LINEUP_EXTRA_FORWARD_LABEL,
      kind: "extra-forward",
    });
  }
  if (lineup.goalies[1]) {
    out.push({
      playerId: lineup.goalies[1],
      label: MATCH_LINEUP_SECOND_GOALIE_LABEL,
      kind: "second-goalie",
    });
  }
  return out;
}

/**
 * Štítek pozice a typ dresu pro export PNG — počítá se podle skutečného umístění hráče v sestavě (ne jen podle indexu řádku).
 */
export function jerseyPosterExportRowMeta(
  lineup: LineupStructure,
  group: MatchLineupPosterGroup,
  playerId: string,
  defenseCount: 6 | 7 | 8,
  allowExtraForward: boolean
): { positionLabel: string; jerseyKind: "goalie" | "skater" } {
  if (group === "goalies") return { positionLabel: "G", jerseyKind: "goalie" };
  if (group === "defense") return { positionLabel: "D", jerseyKind: "skater" };
  if (group === "forwards-12" || group === "forwards-34") {
    return { positionLabel: "F", jerseyKind: "skater" };
  }

  if (group !== "line-1" && group !== "line-2" && group !== "line-3" && group !== "line-4") {
    return { positionLabel: "F", jerseyKind: "skater" };
  }

  const lineIdx = group === "line-1" ? 0 : group === "line-2" ? 1 : group === "line-3" ? 2 : 3;

  if (group === "line-1" && lineup.goalies[0] === playerId) {
    return { positionLabel: "G", jerseyKind: "goalie" };
  }
  if (group === "line-4" && lineup.goalies[1] === playerId) {
    return { positionLabel: "G", jerseyKind: "goalie" };
  }
  if (group === "line-4" && allowExtraForward && lineup.extraForwards[0] === playerId) {
    return { positionLabel: "F", jerseyKind: "skater" };
  }

  const fl = lineup.forwardLines[lineIdx];
  if (fl?.lw === playerId || fl?.c === playerId || fl?.rw === playerId) {
    return { positionLabel: "F", jerseyKind: "skater" };
  }

  const maxPairIdx = defenseCount === 8 ? 3 : defenseCount === 7 ? 3 : 2;
  const dIdx = Math.min(lineIdx, maxPairIdx);
  const dp = lineup.defensePairs[dIdx];
  if (dp?.lb === playerId || dp?.rb === playerId) {
    return { positionLabel: "D", jerseyKind: "skater" };
  }

  if (lineup.goalies[2] === playerId) return { positionLabel: "G", jerseyKind: "goalie" };
  return { positionLabel: "F", jerseyKind: "skater" };
}
