import type { Player } from "@/types";
import { leagueForClub } from "./clubLeague";

/** Liga z DB, jinak dopočet z klubu (pro starší řádky před migrací). */
export function resolvePlayerLeague(
  club: string,
  league: string | null | undefined
): string {
  const t = league?.trim();
  if (t) return t;
  return leagueForClub(club);
}

export function playerFromDb(row: {
  id: string;
  name: string;
  position: string;
  role: string | null;
  club: string;
  league: string | null;
}): Player {
  return {
    id: row.id,
    name: row.name,
    position: row.position as Player["position"],
    role: row.role,
    club: row.club,
    league: resolvePlayerLeague(row.club, row.league),
  };
}
