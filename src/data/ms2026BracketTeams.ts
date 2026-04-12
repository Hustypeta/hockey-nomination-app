/**
 * Orientační soupiska 16 týmů pro playoff pick’em (skupiny nejsou oficiální do losování IIHF).
 */

export type BracketTeam = {
  id: string;
  /** Zobrazený název */
  name: string;
};

export const MS2026_BRACKET_TEAMS: BracketTeam[] = [
  { id: "SUI", name: "Švýcarsko" },
  { id: "CAN", name: "Kanada" },
  { id: "CZE", name: "Česko" },
  { id: "USA", name: "USA" },
  { id: "SWE", name: "Švédsko" },
  { id: "FIN", name: "Finsko" },
  { id: "GER", name: "Německo" },
  { id: "SVK", name: "Slovensko" },
  { id: "LAT", name: "Lotyšsko" },
  { id: "NOR", name: "Norsko" },
  { id: "DEN", name: "Dánsko" },
  { id: "AUT", name: "Rakousko" },
  { id: "FRA", name: "Francie" },
  { id: "KAZ", name: "Kazachstán" },
  { id: "GBR", name: "Velká Británie" },
  { id: "HUN", name: "Maďarsko" },
];

const GROUP_A_IDS = ["SUI", "CAN", "GER", "LAT", "NOR", "FRA", "HUN", "GBR"] as const;
const GROUP_B_IDS = ["CZE", "USA", "SWE", "FIN", "SVK", "AUT", "DEN", "KAZ"] as const;

const byId = new Map(MS2026_BRACKET_TEAMS.map((t) => [t.id, t]));

export const MS2026_GROUP_A_TEAMS: BracketTeam[] = GROUP_A_IDS.map((id) => byId.get(id)!);
export const MS2026_GROUP_B_TEAMS: BracketTeam[] = GROUP_B_IDS.map((id) => byId.get(id)!);

/** Typický kříž MS (16 týmů): A1–B4, B2–A3, B1–A4, A2–B3 — pro nápovědu u čtvrtfinále. */
export const MS2026_QF_LABELS = [
  "1. ze skupiny A × 4. ze skupiny B",
  "2. ze skupiny B × 3. ze skupiny A",
  "1. ze skupiny B × 4. ze skupiny A",
  "2. ze skupiny A × 3. ze skupiny B",
] as const;
