import type { LineupStructure, Player } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";

/** Příjmení velkými písmeny + klub (stejná posloupnost jako `buildNamesOnlyRoster`). */
export type NominationWebStyleRow = { name: string; club: string };

function lastUpper(name: string) {
  const parts = name.trim().split(/\s+/);
  const raw = parts[parts.length - 1] || name;
  return raw.toUpperCase();
}

export function nominationWebStyleRowFromId(players: Player[], id: string | null): NominationWebStyleRow {
  if (!id) return { name: "—", club: "—" };
  const p = players.find((x) => x.id === id);
  if (!p) return { name: "—", club: "—" };
  const club = p.club?.trim() ?? "";
  return { name: lastUpper(p.name), club: club.length > 0 ? club : "—" };
}

/** Pořadí jako soupiska jen jména: 3G, 8D, 14F (25 řádků). */
export function buildNominationWebStyleRoster(players: Player[], lineup: LineupStructure) {
  const L = normalizeLineupStructure(lineup);

  const goalies = L.goalies.map((id) => nominationWebStyleRowFromId(players, id));

  const defense: NominationWebStyleRow[] = [];
  for (let i = 0; i < 3; i++) {
    defense.push(nominationWebStyleRowFromId(players, L.defensePairs[i].lb));
    defense.push(nominationWebStyleRowFromId(players, L.defensePairs[i].rb));
  }
  defense.push(nominationWebStyleRowFromId(players, L.defensePairs[3].lb));
  defense.push(nominationWebStyleRowFromId(players, L.extraDefensemen[0] ?? null));

  const forwards: NominationWebStyleRow[] = [];
  for (let i = 0; i < 4; i++) {
    const line = L.forwardLines[i];
    forwards.push(nominationWebStyleRowFromId(players, line.lw));
    forwards.push(nominationWebStyleRowFromId(players, line.c));
    forwards.push(nominationWebStyleRowFromId(players, line.rw));
  }
  forwards.push(nominationWebStyleRowFromId(players, L.forwardLines[3].x));
  forwards.push(nominationWebStyleRowFromId(players, L.extraForwards[0] ?? null));

  return { goalies, defense, forwards };
}
