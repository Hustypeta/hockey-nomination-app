/**
 * Oficiální program MS v hokeji 2026 (skupiny + play-off) pro fantasy „den“ = kalendářní datum ve Švýcarsku.
 * Časy zápasů v ISO UTC (aréna = švýcarský čas, odpovídá CEST v květnu).
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
};

export type Ms2026FantasyOfficialGameDaySeed = {
  slug: string;
  title: string;
  sortOrder: number;
  matches: Ms2026FantasyOfficialMatch[];
  /**
   * Pokud chybí, `lockAt` v DB = nejdřívější `matches[].startAt`.
   * 27. 5. je pauza — uzávěrka = první čtvrtfinále (28. 5.).
   */
  lockAt?: string;
};

export const MS2026_FANTASY_OFFICIAL_GAME_DAYS: Ms2026FantasyOfficialGameDaySeed[] = [
  {
    slug: "2026-05-15",
    title: "MS 2026 — pátek 15. 5.",
    sortOrder: 1,
    matches: [
      { startAt: "2026-05-15T14:20:00.000Z", home: "FIN", away: "GER", group: "A" },
      { startAt: "2026-05-15T14:20:00.000Z", home: "CAN", away: "SWE", group: "B" },
      { startAt: "2026-05-15T18:20:00.000Z", home: "USA", away: "SUI", group: "A" },
      { startAt: "2026-05-15T18:20:00.000Z", home: "CZE", away: "DEN", group: "B" },
    ],
  },
  {
    slug: "2026-05-16",
    title: "MS 2026 — sobota 16. 5.",
    sortOrder: 2,
    matches: [
      { startAt: "2026-05-16T10:20:00.000Z", home: "GBR", away: "AUT", group: "A" },
      { startAt: "2026-05-16T10:20:00.000Z", home: "SVK", away: "NOR", group: "B" },
      { startAt: "2026-05-16T14:20:00.000Z", home: "HUN", away: "FIN", group: "A" },
      { startAt: "2026-05-16T14:20:00.000Z", home: "ITA", away: "CAN", group: "B" },
      { startAt: "2026-05-16T18:20:00.000Z", home: "SUI", away: "LAT", group: "A" },
      { startAt: "2026-05-16T18:20:00.000Z", home: "SLO", away: "CZE", group: "B" },
    ],
  },
  {
    slug: "2026-05-17",
    title: "MS 2026 — neděle 17. 5.",
    sortOrder: 3,
    matches: [
      { startAt: "2026-05-17T10:20:00.000Z", home: "GBR", away: "USA", group: "A" },
      { startAt: "2026-05-17T10:20:00.000Z", home: "ITA", away: "SVK", group: "B" },
      { startAt: "2026-05-17T14:20:00.000Z", home: "AUT", away: "HUN", group: "A" },
      { startAt: "2026-05-17T14:20:00.000Z", home: "DEN", away: "SWE", group: "B" },
      { startAt: "2026-05-17T18:20:00.000Z", home: "GER", away: "LAT", group: "A" },
      { startAt: "2026-05-17T18:20:00.000Z", home: "NOR", away: "SLO", group: "B" },
    ],
  },
  {
    slug: "2026-05-18",
    title: "MS 2026 — pondělí 18. 5.",
    sortOrder: 4,
    matches: [
      { startAt: "2026-05-18T14:20:00.000Z", home: "FIN", away: "USA", group: "A" },
      { startAt: "2026-05-18T14:20:00.000Z", home: "CAN", away: "DEN", group: "B" },
      { startAt: "2026-05-18T18:20:00.000Z", home: "GER", away: "SUI", group: "A" },
      { startAt: "2026-05-18T18:20:00.000Z", home: "SWE", away: "CZE", group: "B" },
    ],
  },
  {
    slug: "2026-05-19",
    title: "MS 2026 — úterý 19. 5.",
    sortOrder: 5,
    matches: [
      { startAt: "2026-05-19T14:20:00.000Z", home: "LAT", away: "AUT", group: "A" },
      { startAt: "2026-05-19T14:20:00.000Z", home: "ITA", away: "NOR", group: "B" },
      { startAt: "2026-05-19T18:20:00.000Z", home: "HUN", away: "GBR", group: "A" },
      { startAt: "2026-05-19T18:20:00.000Z", home: "SLO", away: "SVK", group: "B" },
    ],
  },
  {
    slug: "2026-05-20",
    title: "MS 2026 — středa 20. 5.",
    sortOrder: 6,
    matches: [
      { startAt: "2026-05-20T14:20:00.000Z", home: "AUT", away: "SUI", group: "A" },
      { startAt: "2026-05-20T14:20:00.000Z", home: "CZE", away: "ITA", group: "B" },
      { startAt: "2026-05-20T18:20:00.000Z", home: "USA", away: "GER", group: "A" },
      { startAt: "2026-05-20T18:20:00.000Z", home: "SWE", away: "SLO", group: "B" },
    ],
  },
  {
    slug: "2026-05-21",
    title: "MS 2026 — čtvrtek 21. 5.",
    sortOrder: 7,
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
    matches: [
      { startAt: "2026-05-30T13:20:00.000Z", phase: "Semifinále", label: "Semifinále 1 (Swiss Life Arena, Zürich)" },
      { startAt: "2026-05-30T18:00:00.000Z", phase: "Semifinále", label: "Semifinále 2 (Swiss Life Arena, Zürich)" },
    ],
  },
  {
    slug: "2026-05-31",
    title: "MS 2026 — neděle 31. 5. (medaile)",
    sortOrder: 17,
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

export function ms2026FantasySortedMatches(row: Ms2026FantasyOfficialGameDaySeed): Ms2026FantasyOfficialMatch[] {
  return [...row.matches].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}
