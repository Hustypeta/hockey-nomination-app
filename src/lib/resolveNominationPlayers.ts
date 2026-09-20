import type { Player } from "@/types";
import { prisma } from "@/lib/prisma";
import { leagueForClub } from "@/lib/clubLeague";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import {
  getAmbiguousLastNameKeysFromNames,
  withJerseyLastNames,
} from "@/lib/jerseyDisplayName";

/**
 * Jména a kluby z kandidátního JSON (aktuální ID `cand_…`),
 * doplnění ze starších záznamů v DB (cuid) pro starší uložené nominace.
 */
export async function resolvePlayersByIds(ids: string[]): Promise<Player[]> {
  const candidates = loadMs2026Candidates();
  const candMap = new Map(candidates.map((p) => [p.id, p]));
  const missing = ids.filter((id) => !candMap.has(id));
  if (missing.length > 0) {
    const rows = await prisma.player.findMany({
      where: { id: { in: missing } },
    });
    for (const r of rows) {
      candMap.set(r.id, {
        id: r.id,
        name: r.name,
        position: r.position as Player["position"],
        role: r.role,
        club: r.club,
        league: r.league?.trim() || leagueForClub(r.club),
        jerseyNumber: r.jerseyNumber ?? null,
        pick_rate: 0,
      });
    }
  }
  const resolved = ids.map((id) => candMap.get(id)).filter((p): p is Player => p != null);
  const keys = getAmbiguousLastNameKeysFromNames([
    ...candidates.map((p) => p.name),
    ...resolved.map((p) => p.name),
  ]);
  return withJerseyLastNames(resolved, keys);
}
