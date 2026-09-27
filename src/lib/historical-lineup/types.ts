/** Stejný tvar, jaký bude mít Excel (listy `puzzles` + `players`). */

export const HISTORICAL_LINEUP_SLOTS = ["LW", "C", "RW", "LB", "RB", "G"] as const;
export type HistoricalLineupSlot = (typeof HISTORICAL_LINEUP_SLOTS)[number];

export type HistoricalLineupPosition = "G" | "D" | "F";

export type HistoricalLineupPuzzleMeta = {
  id: string;
  day: number;
  publishDate: string | null;
  matchDate: string;
  event: string;
  round: string | null;
  opponent: string;
  hint: string | null;
};

export type HistoricalLineupPlayerRow = {
  puzzleId: string;
  name: string;
  position: HistoricalLineupPosition;
  role: string | null;
  /** Vyplněné jen u správné šestky. */
  slot: HistoricalLineupSlot | null;
  isAnswer: boolean;
  jersey: number | null;
  club: string | null;
};

export type HistoricalLineupPuzzle = HistoricalLineupPuzzleMeta & {
  players: HistoricalLineupPlayerRow[];
};

export type HistoricalLineupGuess = Record<HistoricalLineupSlot, string | null>;

export type HistoricalLineupSlotResult = "correct" | "wrong";

export type HistoricalLineupScore = {
  points: number;
  max: number;
  bySlot: Record<HistoricalLineupSlot, HistoricalLineupSlotResult>;
};
