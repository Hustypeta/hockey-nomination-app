export type Position = "G" | "D" | "F";
export type Role = "G" | "RW" | "LW" | "C" | "RB" | "LB";

export interface Player {
  id: string;
  name: string;
  position: Position;
  role?: string | null; // RW, LW, C, RB, LB
  club: string;
  league: string;
  /** Dresové číslo z reprezentace (jen pokud hráč v A-týmu nastoupil a máme ho v datech). */
  jerseyNumber?: number | null;
  /** Volitelná URL fotky (např. budoucí rozšíření dat). */
  imageUrl?: string | null;
}

export const ROLE_LABELS: Record<Role, string> = {
  G: "Brankář",
  RW: "Pravé křídlo",
  LW: "Levé křídlo",
  C: "Střední útočník",
  RB: "Pravý bek",
  LB: "Levý bek",
};

export const POSITION_LIMITS = {
  G: 3,
  D: 7,
  F: 15,
} as const;

export const TOTAL_PLAYERS = 25;

export const POSITION_LABELS: Record<Position, string> = {
  G: "Brankáři",
  D: "Obránci",
  F: "Útočníci",
};

// Struktura sestavy (fantasy style – lajny + náhradníci)
export interface ForwardLine {
  lw: string | null; // playerId
  c: string | null;
  rw: string | null;
}

export interface DefensePair {
  lb: string | null;
  rb: string | null;
}

export interface LineupStructure {
  forwardLines: [ForwardLine, ForwardLine, ForwardLine, ForwardLine]; // 1.–4. lajna
  /** Čtvrtý pár je v datech rezervovaný (vždy prázdný); beků je 7 v prvních třech párech + náhradník. */
  defensePairs: [DefensePair, DefensePair, DefensePair, DefensePair];
  goalies: [string | null, string | null, string | null]; // 3 brankáři
  /** Tři pevné sloty EX1–EX3 (`null` = prázdné). */
  extraForwards: [string | null, string | null, string | null];
  /** Nejdeš 7 beků: max. jeden náhradní obránce. */
  extraDefensemen: string[];
  assistantIds?: string[];
}

export const EMPTY_LINEUP: LineupStructure = {
  forwardLines: [
    { lw: null, c: null, rw: null },
    { lw: null, c: null, rw: null },
    { lw: null, c: null, rw: null },
    { lw: null, c: null, rw: null },
  ],
  defensePairs: [
    { lb: null, rb: null },
    { lb: null, rb: null },
    { lb: null, rb: null },
    { lb: null, rb: null },
  ],
  goalies: [null, null, null],
  extraForwards: [null, null, null],
  extraDefensemen: [],
  assistantIds: [],
};
