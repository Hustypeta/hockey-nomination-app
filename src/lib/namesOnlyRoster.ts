import type { LineupStructure, Player } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";

function lastUpper(name: string) {
  const parts = name.trim().split(/\s+/);
  const raw = parts[parts.length - 1] || name;
  return raw.toUpperCase();
}

export function rosterLastDisplay(players: Player[], id: string | null): string {
  if (!id) return "—";
  const p = players.find((x) => x.id === id);
  return p ? lastUpper(p.name) : "—";
}

/** Pořadí jmen jako na soupisce: 3G, 8D, 14F (25 hráčů). */
export function buildNamesOnlyRoster(players: Player[], lineup: LineupStructure) {
  const L = normalizeLineupStructure(lineup);
  const goalies = L.goalies.map((id) => rosterLastDisplay(players, id));

  const defense: string[] = [];
  for (let i = 0; i < 3; i++) {
    defense.push(rosterLastDisplay(players, L.defensePairs[i].lb));
    defense.push(rosterLastDisplay(players, L.defensePairs[i].rb));
  }
  defense.push(rosterLastDisplay(players, L.defensePairs[3].lb));
  defense.push(rosterLastDisplay(players, L.extraDefensemen[0] ?? null));

  const forwards: string[] = [];
  for (let i = 0; i < 4; i++) {
    const line = L.forwardLines[i];
    forwards.push(rosterLastDisplay(players, line.lw));
    forwards.push(rosterLastDisplay(players, line.c));
    forwards.push(rosterLastDisplay(players, line.rw));
  }
  forwards.push(rosterLastDisplay(players, L.forwardLines[3].x));
  forwards.push(rosterLastDisplay(players, L.extraForwards[0] ?? null));

  return { goalies, defense, forwards };
}
