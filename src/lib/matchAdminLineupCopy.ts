/** Minimální řádek zápasu pro výběr „předchozí“ sestavy v adminu. */
export type MatchRowForLineupCopy = {
  id: string;
  title: string;
  category?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
  startsAt: string | null;
  hasOfficialLineup: boolean;
};

/**
 * Najde nejbližší starší zápas se sestavou — stejná kategorie, ideálně sdílený tým (HOME/AWAY).
 */
export function findPreviousMatchForLineupCopy(
  active: MatchRowForLineupCopy,
  matches: MatchRowForLineupCopy[]
): MatchRowForLineupCopy | null {
  const activeAt = active.startsAt ? new Date(active.startsAt).getTime() : Number.NaN;
  const teams = new Set(
    [active.homeCode, active.awayCode]
      .map((c) => (c ?? "").trim().toUpperCase())
      .filter(Boolean)
  );

  const candidates = matches.filter((m) => {
    if (m.id === active.id) return false;
    if (!m.hasOfficialLineup) return false;
    if (active.category && m.category !== active.category) return false;
    if (!Number.isNaN(activeAt)) {
      const t = m.startsAt ? new Date(m.startsAt).getTime() : Number.NaN;
      if (!Number.isNaN(t) && t >= activeAt) return false;
    }
    return true;
  });

  const withOverlap =
    teams.size > 0
      ? candidates.filter((m) => {
          const h = (m.homeCode ?? "").trim().toUpperCase();
          const a = (m.awayCode ?? "").trim().toUpperCase();
          return teams.has(h) || teams.has(a);
        })
      : candidates;

  const pool = withOverlap.length > 0 ? withOverlap : candidates;
  pool.sort((a, b) => {
    const ta = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const tb = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return tb - ta;
  });
  return pool[0] ?? null;
}
