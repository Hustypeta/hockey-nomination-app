/** Reprezentace v MS fantasy poolu (kód IIHF v `team`). Pořadí pro UI výběr. */
export const MS_FANTASY_ROSTER_TEAM_OPTIONS: { code: string; labelCs: string }[] = [
  { code: "AUT", labelCs: "Rakousko" },
  { code: "CAN", labelCs: "Kanada" },
  { code: "CZE", labelCs: "Česko" },
  { code: "DEN", labelCs: "Dánsko" },
  { code: "FIN", labelCs: "Finsko" },
  { code: "GER", labelCs: "Německo" },
  { code: "GBR", labelCs: "Velká Británie" },
  { code: "HUN", labelCs: "Maďarsko" },
  { code: "ITA", labelCs: "Itálie" },
  { code: "LAT", labelCs: "Lotyšsko" },
  { code: "NOR", labelCs: "Norsko" },
  { code: "SLO", labelCs: "Slovinsko" },
  { code: "SVK", labelCs: "Slovensko" },
  { code: "SUI", labelCs: "Švýcarsko" },
  { code: "SWE", labelCs: "Švédsko" },
  { code: "USA", labelCs: "USA" },
];

const TEAM_SET = new Set(MS_FANTASY_ROSTER_TEAM_OPTIONS.map((t) => t.code));

export const MS_FANTASY_TIER_CODES = ["A", "B", "C", "D", "E"] as const;

export function isAllowedMsFantasyTeamCode(code: string): boolean {
  return TEAM_SET.has(code.trim().toUpperCase());
}

export function isAllowedMsFantasyTier(tier: string): boolean {
  const t = tier.trim().toUpperCase();
  return (MS_FANTASY_TIER_CODES as readonly string[]).includes(t);
}
