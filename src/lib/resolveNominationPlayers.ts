import type { Player } from "@/types";
import { prisma } from "@/lib/prisma";
import { leagueForClub } from "@/lib/clubLeague";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";

/**
 * Jména a kluby z kandidátního JSON (aktuální ID `cand_…`),
 * doplnění ze starších záznamů v DB (cuid) pro starší uložené nominace.
 */
export async function resolvePlayersByIds(ids: string[]): Promise<Player[]> {
  const candMap = new Map(loadMs2026Candidates().map((p) => [p.id, p]));
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
  return ids.map((id) => candMap.get(id)).filter((p): p is Player => p != null);
}
