import { loadMs2026Candidates } from "@/lib/ms2026Candidates";

/** Řádek pro stránku Hráči — stejný pool jako editor nominace. */
export type NominationContestPlayerRow = {
  id: string;
  name: string;
  position: string;
  role: string | null;
  club: string;
  league: string;
  jerseyNumber: number | null;
};

export function loadNominationContestPlayers(): NominationContestPlayerRow[] {
  return loadMs2026Candidates()
    .map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      role: p.role ?? null,
      club: p.club,
      league: p.league ?? "—",
      jerseyNumber: p.jerseyNumber ?? null,
    }))
    .sort((a, b) => {
      const posOrder = { G: 0, D: 1, F: 2 } as const;
      const pa = posOrder[a.position as keyof typeof posOrder] ?? 9;
      const pb = posOrder[b.position as keyof typeof posOrder] ?? 9;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name, "cs");
    });
}
