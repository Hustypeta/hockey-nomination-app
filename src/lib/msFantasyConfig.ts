/**
 * MS Fantasy — pravidla soutěže (synchronní s produktovým zadáním).
 * Úpravy capu / tier cen zde + v Prisma seed / importu Excelu.
 */

export const MS_FANTASY_CAP = 144;
export const MS_FANTASY_TEAM_SIZE = 6;
/** Přesně jeden G, zbytek bruslaři (F/D). */
export const MS_FANTASY_MIN_GOALIES = 1;
export const MS_FANTASY_MAX_GOALIES = 1;

/** Cena podle tieru (A nejdražší). */
export const MS_FANTASY_TIER_SALARY: Record<string, number> = {
  A: 34,
  B: 28,
  C: 22,
  D: 16,
  E: 14,
};

/**
 * Povolit stránky `/fantasy/*` (menu má Fantasy vždy; vypnutí např. před spuštěním: env na false).
 */
export function isMsFantasyVisibleToUsers(): boolean {
  const v = process.env.NEXT_PUBLIC_MS_FANTASY_VISIBLE?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  return true;
}

export const MS_FANTASY_TIERS = ["A", "B", "C", "D", "E"] as const;
export type MsFantasyTier = (typeof MS_FANTASY_TIERS)[number];

export function salaryForTier(tier: string): number {
  return MS_FANTASY_TIER_SALARY[tier] ?? MS_FANTASY_TIER_SALARY.E;
}

/** Bodování na hráče / zápas (bez střel a hitů). Rozšíření: import box score. */
export type MsFantasySkaterBox = {
  goals: number;
  assists: number;
  plusMinus: number;
};

export type MsFantasyGoalieBox = {
  wins: number;
  goalsAgainst: number;
  shutouts: number;
};

export const MS_FANTASY_POINTS = {
  skater: {
    goal: 4,
    assist: 2,
    plusMinus: 1,
  },
  goalie: {
    win: 3,
    goalAgainst: -1,
    shutout: 3,
  },
} as const;
