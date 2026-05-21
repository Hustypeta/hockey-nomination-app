/**
 * Oficiální program MS v hokeji 2026 (skupiny + play-off) pro fantasy „den“ = kalendářní datum ve Švýcarsku.
 * Časy zápasů v ISO UTC (aréna = švýcarský čas, odpovídá CEST v květnu).
 *
 * **Uzávěrka fantasy (`lockAt`)** = začátek prvního zápasu dne v čase arény (pro ČR zobrazeno jako CEST).
 * U každého dne je `lockAt` vždy vyplněný explicitně (ne jen z `min(matches)`), aby se při úpravě pořadí
 * zápasů omylem nezměnil konec sestavování.
 *
 * Kalendář prvních bulů (CEST) → `lockAt` UTC (CEST − 2 v květnu 2026):
 * 15. 16:20, 16. 12:20, 17. 12:20, 18.–22. 16:20, 23. 12:20, 24.–25. 16:20, 26. 12:20,
 * 27. pauza (technický lock až na 28. 16:20), 28. 16:20, 29. pauza (lock na 30. 15:20), 30. 15:20, 31. 15:30.
 *
 * Kanonický zdroj: [IIHF — Schedule and Results 2026](https://www.iihf.com/en/events/2026/wm/schedule).
 * Pořadí `home` / `away` odpovídá zápisu na IIHF (první tým v „X vs Y“).
 */
export type Ms2026FantasyOfficialMatch = {
  startAt: string;
  home?: string;
  away?: string;
  group?: "A" | "B";
  phase?: string;
  /** Když ještě nejsou známi soupeři (play-off). */
  label?: string;
  /** Konečný výsledek (domácí : hosté). */
  homeScore?: number;
  awayScore?: number;
};

export type Ms2026FantasyOfficialGameDaySeed = {
  slug: string;
  title: string;
  sortOrder: number;
  matches: Ms2026FantasyOfficialMatch[];
  /**
   * Konec sestavování fantasy pro tento kalendářní den (UTC). Vždy vyplnit — kanonické časy viz hlavičkový komentář souboru.
   * Pro pauzy 27. a 29. 5. je to technický čas směrem k dalšímu hracímu dni; v UI se uzávěrka u těchto dnů nezobrazuje.
   */
  lockAt?: string;
};

export const MS2026_FANTASY_OFFICIAL_GAME_DAYS: Ms2026FantasyOfficialGameDaySeed[] = [
  {
    slug: "2026-05-15",
    title: "MS 2026 — pátek 15. 5.",
    sortOrder: 1,
    lockAt: "2026-05-15T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-15T14:20:00.000Z", home: "FIN", away: "GER", group: "A", homeScore: 3, awayScore: 1 },
      { startAt: "2026-05-15T14:20:00.000Z", home: "CAN", away: "SWE", group: "B", homeScore: 5, awayScore: 3 },
      { startAt: "2026-05-15T18:20:00.000Z", home: "USA", away: "SUI", group: "A", homeScore: 1, awayScore: 3 },
      { startAt: "2026-05-15T18:20:00.000Z", home: "CZE", away: "DEN", group: "B", homeScore: 4, awayScore: 1 },
    ],
  },
  {
    slug: "2026-05-16",
    title: "MS 2026 — sobota 16. 5.",
    sortOrder: 2,
    lockAt: "2026-05-16T10:20:00.000Z",
    matches: [
      { startAt: "2026-05-16T10:20:00.000Z", home: "GBR", away: "AUT", group: "A", homeScore: 2, awayScore: 5 },
      { startAt: "2026-05-16T10:20:00.000Z", home: "SVK", away: "NOR", group: "B", homeScore: 2, awayScore: 1 },
      { startAt: "2026-05-16T14:20:00.000Z", home: "HUN", away: "FIN", group: "A", homeScore: 1, awayScore: 4 },
      { startAt: "2026-05-16T14:20:00.000Z", home: "ITA", away: "CAN", group: "B", homeScore: 0, awayScore: 6 },
      { startAt: "2026-05-16T18:20:00.000Z", home: "SUI", away: "LAT", group: "A", homeScore: 4, awayScore: 2 },
      { startAt: "2026-05-16T18:20:00.000Z", home: "SLO", away: "CZE", group: "B", homeScore: 3, awayScore: 2 },
    ],
  },
  {
    slug: "2026-05-17",
    title: "MS 2026 — neděle 17. 5.",
    sortOrder: 3,
    lockAt: "2026-05-17T10:20:00.000Z",
    matches: [
      { startAt: "2026-05-17T10:20:00.000Z", home: "GBR", away: "USA", group: "A", homeScore: 1, awayScore: 5 },
      { startAt: "2026-05-17T10:20:00.000Z", home: "ITA", away: "SVK", group: "B", homeScore: 1, awayScore: 4 },
      { startAt: "2026-05-17T14:20:00.000Z", home: "AUT", away: "HUN", group: "A", homeScore: 4, awayScore: 2 },
      { startAt: "2026-05-17T14:20:00.000Z", home: "DEN", away: "SWE", group: "B", homeScore: 2, awayScore: 6 },
      { startAt: "2026-05-17T18:20:00.000Z", home: "GER", away: "LAT", group: "A", homeScore: 0, awayScore: 2 },
      { startAt: "2026-05-17T18:20:00.000Z", home: "NOR", away: "SLO", group: "B", homeScore: 4, awayScore: 0 },
    ],
  },
  {
    slug: "2026-05-18",
    title: "MS 2026 — pondělí 18. 5.",
    sortOrder: 4,
    lockAt: "2026-05-18T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-18T14:20:00.000Z", home: "FIN", away: "USA", group: "A", homeScore: 6, awayScore: 2 },
      { startAt: "2026-05-18T14:20:00.000Z", home: "CAN", away: "DEN", group: "B", homeScore: 5, awayScore: 1 },
      { startAt: "2026-05-18T18:20:00.000Z", home: "GER", away: "SUI", group: "A", homeScore: 1, awayScore: 6 },
      { startAt: "2026-05-18T18:20:00.000Z", home: "SWE", away: "CZE", group: "B", homeScore: 3, awayScore: 4 },
    ],
  },
  {
    slug: "2026-05-19",
    title: "MS 2026 — úterý 19. 5.",
    sortOrder: 5,
    lockAt: "2026-05-19T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-19T14:20:00.000Z", home: "LAT", away: "AUT", group: "A", homeScore: 1, awayScore: 3 },
      { startAt: "2026-05-19T14:20:00.000Z", home: "ITA", away: "NOR", group: "B", homeScore: 0, awayScore: 4 },
      { startAt: "2026-05-19T18:20:00.000Z", home: "HUN", away: "GBR", group: "A", homeScore: 5, awayScore: 0 },
      { startAt: "2026-05-19T18:20:00.000Z", home: "SLO", away: "SVK", group: "B", homeScore: 4, awayScore: 5 },
    ],
  },
  {
    slug: "2026-05-20",
    title: "MS 2026 — středa 20. 5.",
    sortOrder: 6,
    lockAt: "2026-05-20T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-20T14:20:00.000Z", home: "AUT", away: "SUI", group: "A", homeScore: 0, awayScore: 9 },
      { startAt: "2026-05-20T14:20:00.000Z", home: "CZE", away: "ITA", group: "B", homeScore: 3, awayScore: 1 },
      { startAt: "2026-05-20T18:20:00.000Z", home: "USA", away: "GER", group: "A", homeScore: 4, awayScore: 3 },
      { startAt: "2026-05-20T18:20:00.000Z", home: "SWE", away: "SLO", group: "B", homeScore: 6, awayScore: 0 },
    ],
  },
  {
    slug: "2026-05-21",
    title: "MS 2026 — čtvrtek 21. 5.",
    sortOrder: 7,
    lockAt: "2026-05-21T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-21T14:20:00.000Z", home: "LAT", away: "FIN", group: "A" },
      { startAt: "2026-05-21T14:20:00.000Z", home: "CAN", away: "NOR", group: "B" },
      { startAt: "2026-05-21T18:20:00.000Z", home: "SUI", away: "GBR", group: "A" },
      { startAt: "2026-05-21T18:20:00.000Z", home: "DEN", away: "SVK", group: "B" },
    ],
  },
  {
    slug: "2026-05-22",
    title: "MS 2026 — pátek 22. 5.",
    sortOrder: 8,
    lockAt: "2026-05-22T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-22T14:20:00.000Z", home: "GER", away: "HUN", group: "A" },
      { startAt: "2026-05-22T14:20:00.000Z", home: "CAN", away: "SLO", group: "B" },
      { startAt: "2026-05-22T18:20:00.000Z", home: "FIN", away: "GBR", group: "A" },
      { startAt: "2026-05-22T18:20:00.000Z", home: "SWE", away: "ITA", group: "B" },
    ],
  },
  {
    slug: "2026-05-23",
    title: "MS 2026 — sobota 23. 5.",
    sortOrder: 9,
    lockAt: "2026-05-23T10:20:00.000Z",
    matches: [
      { startAt: "2026-05-23T10:20:00.000Z", home: "LAT", away: "USA", group: "A" },
      { startAt: "2026-05-23T10:20:00.000Z", home: "DEN", away: "SLO", group: "B" },
      { startAt: "2026-05-23T14:20:00.000Z", home: "SUI", away: "HUN", group: "A" },
      { startAt: "2026-05-23T14:20:00.000Z", home: "SVK", away: "CZE", group: "B" },
      { startAt: "2026-05-23T18:20:00.000Z", home: "AUT", away: "GER", group: "A" },
      { startAt: "2026-05-23T18:20:00.000Z", home: "NOR", away: "SWE", group: "B" },
    ],
  },
  {
    slug: "2026-05-24",
    title: "MS 2026 — neděle 24. 5.",
    sortOrder: 10,
    lockAt: "2026-05-24T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-24T14:20:00.000Z", home: "GBR", away: "LAT", group: "A" },
      { startAt: "2026-05-24T14:20:00.000Z", home: "DEN", away: "ITA", group: "B" },
      { startAt: "2026-05-24T18:20:00.000Z", home: "FIN", away: "AUT", group: "A" },
      { startAt: "2026-05-24T18:20:00.000Z", home: "SVK", away: "CAN", group: "B" },
    ],
  },
  {
    slug: "2026-05-25",
    title: "MS 2026 — pondělí 25. 5.",
    sortOrder: 11,
    lockAt: "2026-05-25T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-25T14:20:00.000Z", home: "USA", away: "HUN", group: "A" },
      { startAt: "2026-05-25T14:20:00.000Z", home: "CZE", away: "NOR", group: "B" },
      { startAt: "2026-05-25T18:20:00.000Z", home: "GER", away: "GBR", group: "A" },
      { startAt: "2026-05-25T18:20:00.000Z", home: "SLO", away: "ITA", group: "B" },
    ],
  },
  {
    slug: "2026-05-26",
    title: "MS 2026 — úterý 26. 5.",
    sortOrder: 12,
    lockAt: "2026-05-26T10:20:00.000Z",
    matches: [
      { startAt: "2026-05-26T10:20:00.000Z", home: "HUN", away: "LAT", group: "A" },
      { startAt: "2026-05-26T10:20:00.000Z", home: "NOR", away: "DEN", group: "B" },
      { startAt: "2026-05-26T14:20:00.000Z", home: "USA", away: "AUT", group: "A" },
      { startAt: "2026-05-26T14:20:00.000Z", home: "SWE", away: "SVK", group: "B" },
      { startAt: "2026-05-26T18:20:00.000Z", home: "SUI", away: "FIN", group: "A" },
      { startAt: "2026-05-26T18:20:00.000Z", home: "CZE", away: "CAN", group: "B" },
    ],
  },
  {
    slug: "2026-05-27",
    title: "MS 2026 — středa 27. 5. (pauza)",
    sortOrder: 13,
    matches: [],
    lockAt: "2026-05-28T14:20:00.000Z",
  },
  {
    slug: "2026-05-28",
    title: "MS 2026 — čtvrtek 28. 5. (čtvrtfinále)",
    sortOrder: 14,
    lockAt: "2026-05-28T14:20:00.000Z",
    matches: [
      { startAt: "2026-05-28T14:20:00.000Z", phase: "Čtvrtfinále", label: "Čtvrtfinále 1 (Swiss Life Arena, Zürich)" },
      { startAt: "2026-05-28T14:20:00.000Z", phase: "Čtvrtfinále", label: "Čtvrtfinále 2 (BCF Arena, Fribourg)" },
      { startAt: "2026-05-28T18:20:00.000Z", phase: "Čtvrtfinále", label: "Čtvrtfinále 3 (Swiss Life Arena, Zürich)" },
      { startAt: "2026-05-28T18:20:00.000Z", phase: "Čtvrtfinále", label: "Čtvrtfinále 4 (BCF Arena, Fribourg)" },
    ],
  },
  {
    slug: "2026-05-29",
    title: "MS 2026 — pátek 29. 5. (pauza)",
    sortOrder: 15,
    matches: [],
    lockAt: "2026-05-30T13:20:00.000Z",
  },
  {
    slug: "2026-05-30",
    title: "MS 2026 — sobota 30. 5. (semifinále)",
    sortOrder: 16,
    lockAt: "2026-05-30T13:20:00.000Z",
    matches: [
      { startAt: "2026-05-30T13:20:00.000Z", phase: "Semifinále", label: "Semifinále 1 (Swiss Life Arena, Zürich)" },
      { startAt: "2026-05-30T18:00:00.000Z", phase: "Semifinále", label: "Semifinále 2 (Swiss Life Arena, Zürich)" },
    ],
  },
  {
    slug: "2026-05-31",
    title: "MS 2026 — neděle 31. 5. (medaile)",
    sortOrder: 17,
    lockAt: "2026-05-31T13:30:00.000Z",
    matches: [
      { startAt: "2026-05-31T13:30:00.000Z", phase: "O bronz", label: "Zápas o bronz (Swiss Life Arena, Zürich)" },
      { startAt: "2026-05-31T18:20:00.000Z", phase: "Finále", label: "Finále (Swiss Life Arena, Zürich)" },
    ],
  },
];

export function ms2026FantasyResolveLockAt(row: Ms2026FantasyOfficialGameDaySeed): Date {
  if (row.lockAt) return new Date(row.lockAt);
  const times = row.matches.map((m) => new Date(m.startAt).getTime()).filter((t) => !Number.isNaN(t));
  if (times.length === 0) {
    throw new Error(`MS2026 fantasy den ${row.slug}: chybí lockAt i zápasy.`);
  }
  return new Date(Math.min(...times));
}

/** UTC ISO uzávěrky z kanonického kalendáře — pro API má přednost před `lockAt` v DB (seed může být starý). */
export function ms2026FantasyOfficialLockAtIso(slug: string): string | null {
  const s = slug.trim();
  const row = MS2026_FANTASY_OFFICIAL_GAME_DAYS.find((d) => d.slug === s);
  if (!row) return null;
  return ms2026FantasyResolveLockAt(row).toISOString();
}

export function ms2026FantasySortedMatches(row: Ms2026FantasyOfficialGameDaySeed): Ms2026FantasyOfficialMatch[] {
  return [...row.matches].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}
