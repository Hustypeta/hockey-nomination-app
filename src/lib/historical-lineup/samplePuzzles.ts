import type {
  HistoricalLineupPlayerRow,
  HistoricalLineupPuzzle,
} from "@/lib/historical-lineup/types";

function row(
  puzzleId: string,
  name: string,
  position: HistoricalLineupPlayerRow["position"],
  opts: {
    role?: string | null;
    slot?: HistoricalLineupPlayerRow["slot"];
    jersey?: number | null;
    club?: string | null;
  } = {}
): HistoricalLineupPlayerRow {
  return {
    puzzleId,
    name,
    position,
    role: opts.role ?? opts.slot ?? null,
    slot: opts.slot ?? null,
    isAnswer: Boolean(opts.slot),
    jersey: opts.jersey ?? null,
    club: opts.club ?? null,
  };
}

/** Zkušební data ve tvaru Excelu — po importu nahradíme. */
export const SAMPLE_HISTORICAL_LINEUP_PUZZLES: HistoricalLineupPuzzle[] = [
  {
    id: "nagano-1998-final",
    day: 1,
    publishDate: null,
    matchDate: "1998-02-22",
    event: "ZOH Nagano 1998",
    round: "finále",
    opponent: "Rusko",
    hint: null,
    players: [
      row("nagano-1998-final", "Martin Ručinský", "F", { slot: "LW", jersey: 28 }),
      row("nagano-1998-final", "Robert Reichel", "F", { slot: "C", jersey: 21 }),
      row("nagano-1998-final", "Jaromír Jágr", "F", { slot: "RW", jersey: 68 }),
      row("nagano-1998-final", "Roman Hamrlík", "D", { slot: "LB", jersey: 44 }),
      row("nagano-1998-final", "Jiří Šlégr", "D", { slot: "RB", jersey: 71 }),
      row("nagano-1998-final", "Dominik Hašek", "G", { slot: "G", jersey: 39 }),
      row("nagano-1998-final", "Martin Straka", "F", { role: "C", jersey: 82 }),
      row("nagano-1998-final", "Pavel Patera", "F", { role: "C", jersey: 18 }),
      row("nagano-1998-final", "Jiří Dopita", "F", { role: "C", jersey: 20 }),
      row("nagano-1998-final", "Milan Hejduk", "F", { role: "RW", jersey: 23 }),
      row("nagano-1998-final", "Jan Čaloun", "F", { role: "RW", jersey: 26 }),
      row("nagano-1998-final", "Josef Beránek", "F", { role: "LW", jersey: 10 }),
      row("nagano-1998-final", "Richard Šmehlík", "D", { role: "LB", jersey: 42 }),
      row("nagano-1998-final", "František Kučera", "D", { role: "RB", jersey: 4 }),
      row("nagano-1998-final", "Petr Svoboda", "D", { role: "LB", jersey: 5 }),
      row("nagano-1998-final", "Roman Turek", "G", { role: "G", jersey: 1 }),
      row("nagano-1998-final", "Milan Hnilička", "G", { role: "G", jersey: 2 }),
    ],
  },
  {
    id: "ms-2010-final",
    day: 2,
    publishDate: null,
    matchDate: "2010-05-23",
    event: "MS 2010",
    round: "finále",
    opponent: "Rusko",
    hint: null,
    players: [
      row("ms-2010-final", "Jaromír Jágr", "F", { slot: "RW", jersey: 68 }),
      row("ms-2010-final", "Tomáš Plekanec", "F", { slot: "C", jersey: 14 }),
      row("ms-2010-final", "Patrik Eliáš", "F", { slot: "LW", jersey: 9 }),
      row("ms-2010-final", "Tomáš Kaberle", "D", { slot: "LB", jersey: 15 }),
      row("ms-2010-final", "Marek Židlický", "D", { slot: "RB", jersey: 3 }),
      row("ms-2010-final", "Tomáš Vokoun", "G", { slot: "G", jersey: 29 }),
      row("ms-2010-final", "David Krejčí", "F", { role: "C", jersey: 46 }),
      row("ms-2010-final", "Martin Havlát", "F", { role: "RW", jersey: 24 }),
      row("ms-2010-final", "Tomáš Rolinek", "F", { role: "LW", jersey: 60 }),
      row("ms-2010-final", "Jakub Voráček", "F", { role: "RW", jersey: 93 }),
      row("ms-2010-final", "Filip Kuba", "D", { role: "LB", jersey: 17 }),
      row("ms-2010-final", "Miroslav Blaťák", "D", { role: "LB", jersey: 8 }),
      row("ms-2010-final", "Karel Rachůnek", "D", { role: "RB", jersey: 6 }),
      row("ms-2010-final", "Jakub Štěpánek", "G", { role: "G", jersey: 1 }),
      row("ms-2010-final", "Ondřej Pavelec", "G", { role: "G", jersey: 31 }),
    ],
  },
];

export function getSampleHistoricalLineupPuzzle(id?: string): HistoricalLineupPuzzle {
  return SAMPLE_HISTORICAL_LINEUP_PUZZLES.find((p) => p.id === id) ?? SAMPLE_HISTORICAL_LINEUP_PUZZLES[0]!;
}
