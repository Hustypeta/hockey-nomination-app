/**
 * Oficiální skupiny MS 2026 — IIHF (oznámení červen 2025).
 * Skupina A: Curych (Swiss Life Arena), skupina B: Fribourg (BCF Arena).
 * @see https://www.iihf.com/en/events/2026/wm/news/68522/groups_for_the_2026_iihf_wm_announced
 */

export type BracketTeam = {
  id: string;
  name: string;
};

/** Skupina A (Zürich): USA, SUI, FIN, GER, LAT, AUT, HUN, GBR */
const GROUP_A_IDS = ["USA", "SUI", "FIN", "GER", "LAT", "AUT", "HUN", "GBR"] as const;

/** Skupina B (Fribourg): CAN, SWE, CZE, DEN, SVK, NOR, SLO, ITA */
const GROUP_B_IDS = ["CAN", "SWE", "CZE", "DEN", "SVK", "NOR", "SLO", "ITA"] as const;

export const MS2026_BRACKET_TEAMS: BracketTeam[] = [
  { id: "USA", name: "USA" },
  { id: "SUI", name: "Švýcarsko" },
  { id: "FIN", name: "Finsko" },
  { id: "GER", name: "Německo" },
  { id: "LAT", name: "Lotyšsko" },
  { id: "AUT", name: "Rakousko" },
  { id: "HUN", name: "Maďarsko" },
  { id: "GBR", name: "Velká Británie" },
  { id: "CAN", name: "Kanada" },
  { id: "SWE", name: "Švédsko" },
  { id: "CZE", name: "Česko" },
  { id: "DEN", name: "Dánsko" },
  { id: "SVK", name: "Slovensko" },
  { id: "NOR", name: "Norsko" },
  { id: "SLO", name: "Slovinsko" },
  { id: "ITA", name: "Itálie" },
];

const byId = new Map(MS2026_BRACKET_TEAMS.map((t) => [t.id, t]));

export const MS2026_GROUP_A_TEAMS: BracketTeam[] = GROUP_A_IDS.map((id) => byId.get(id)!);
export const MS2026_GROUP_B_TEAMS: BracketTeam[] = GROUP_B_IDS.map((id) => byId.get(id)!);

export const MS2026_GROUP_A_VENUE = "Curych · Swiss Life Arena";
export const MS2026_GROUP_B_VENUE = "Fribourg · BCF Arena";

/** Čtvrtfinále MS (cross-over): 1A–4B, 2A–3B, 1B–4A, 2B–3A — dle IIHF. */
export const MS2026_QF_LABELS = [
  "1. ze skupiny A × 4. ze skupiny B",
  "2. ze skupiny A × 3. ze skupiny B",
  "1. ze skupiny B × 4. ze skupiny A",
  "2. ze skupiny B × 3. ze skupiny A",
] as const;
