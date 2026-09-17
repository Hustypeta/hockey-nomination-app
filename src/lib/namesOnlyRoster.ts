import type { LineupStructure, Player } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import {
  getAmbiguousLastNameKeys,
  jerseyNameOnJersey,
} from "@/lib/jerseyDisplayName";

function lastUpper(name: string) {
  const parts = name.trim().split(/\s+/);
  const raw = parts[parts.length - 1] || name;
  return raw.toLocaleUpperCase("cs-CZ");
}

/** Příjmení velkými písmeny (stejné jako export nominace). */
export function rosterLastDisplay(players: Player[], id: string | null): string {
  if (!id) return "—";
  const p = players.find((x) => x.id === id);
  return p ? lastUpper(p.name) : "—";
}

/**
 * Jména pro jeden zobrazený plakát: příjmení, iniciála pouze u jmenovců
 * v téže sestavě. Klíče z jersey utility porovnávají i českou diakritiku.
 */
export function rosterDisplayNamesForIds(
  players: Player[],
  ids: Array<string | null | undefined>
): Map<string, string> {
  const shownIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const byId = new Map(players.map((player) => [player.id, player]));
  const shownPlayers = shownIds
    .map((id) => byId.get(id))
    .filter((player): player is Player => Boolean(player));
  const ambiguousKeys = getAmbiguousLastNameKeys(shownPlayers);

  return new Map(
    shownPlayers.map((player) => [
      player.id,
      jerseyNameOnJersey(player.name, ambiguousKeys).toLocaleUpperCase("cs-CZ"),
    ])
  );
}

export type NamesOnlyRosterEntry = {
  id: string | null;
  name: string;
};

/** Pořadí jmen jako na soupisce: 3G, 8D, 14F (25 hráčů). */
export function buildNamesOnlyRoster(players: Player[], lineup: LineupStructure) {
  const L = normalizeLineupStructure(lineup);
  const displayNames = rosterDisplayNamesForIds(players, [
    ...L.goalies,
    ...L.defensePairs.flatMap((pair) => [pair.lb, pair.rb]),
    ...L.extraDefensemen,
    ...L.forwardLines.flatMap((line) => [line.lw, line.c, line.rw, line.x]),
    ...L.extraForwards,
  ]);
  const entry = (id: string | null): NamesOnlyRosterEntry => ({
    id,
    name: id ? displayNames.get(id) ?? rosterLastDisplay(players, id) : "—",
  });

  const goalies = L.goalies.map((id) => entry(id));

  const defense: NamesOnlyRosterEntry[] = [];
  for (let i = 0; i < 3; i++) {
    defense.push(entry(L.defensePairs[i].lb));
    defense.push(entry(L.defensePairs[i].rb));
  }
  defense.push(entry(L.defensePairs[3].lb));
  defense.push(entry(L.extraDefensemen[0] ?? null));

  const forwards: NamesOnlyRosterEntry[] = [];
  for (let i = 0; i < 4; i++) {
    const line = L.forwardLines[i];
    forwards.push(entry(line.lw));
    forwards.push(entry(line.c));
    forwards.push(entry(line.rw));
  }
  forwards.push(entry(L.forwardLines[3].x));
  forwards.push(entry(L.extraForwards[0] ?? null));

  return { goalies, defense, forwards };
}
