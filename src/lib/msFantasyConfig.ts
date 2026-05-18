/**
 * MS Fantasy — pravidla soutěže (synchronní s produktovým zadáním).
 * Úpravy capu / tier cen zde + v Prisma seed / importu Excelu.
 */

export const MS_FANTASY_CAP = 165;
export const MS_FANTASY_TEAM_SIZE = 6;
/** Přesně jeden G, zbytek bruslaři (F/D). */
export const MS_FANTASY_MIN_GOALIES = 1;
export const MS_FANTASY_MAX_GOALIES = 1;

/** Plat podle tieru — bruslaři (F/D). */
export const MS_FANTASY_TIER_SALARY_SKATER: Record<string, number> = {
  A: 40,
  B: 30,
  C: 25,
  D: 20,
  E: 15,
};

/** Plat podle tieru — brankáři (G). */
export const MS_FANTASY_TIER_SALARY_GOALIE: Record<string, number> = {
  A: 45,
  B: 35,
  C: 28,
  D: 22,
  E: 18,
};

/**
 * @deprecated Použij `MS_FANTASY_TIER_SALARY_SKATER` / `MS_FANTASY_TIER_SALARY_GOALIE` nebo `salaryForTier(tier, position)`.
 * Zůstává jako alias bruslařské tabulky kvůli starším importům / textům.
 */
export const MS_FANTASY_TIER_SALARY = MS_FANTASY_TIER_SALARY_SKATER;

/**
 * Povolit stránky `/fantasy` a editor dne (menu může odkazovat i na vypnutý režim; samotný obsah vyžaduje přihlášení).
 * `/fantasy/pravidla` zůstává dostupné bez účtu. Vypnutí: `NEXT_PUBLIC_MS_FANTASY_VISIBLE=false`.
 */
export function isMsFantasyVisibleToUsers(): boolean {
  const v = process.env.NEXT_PUBLIC_MS_FANTASY_VISIBLE?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  return true;
}

/**
 * Uložení sestavy na server (`POST /api/fantasy/my-lineup`) = účast u daného hracího dne.
 * Vypnutím necháš fantasy stránky zapnuté, ale bez přijímání „odevzdání“ (např. před ostrým startem).
 */
export function isMsFantasyLineupSubmissionEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_MS_FANTASY_SUBMISSION_ENABLED?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  return true;
}

export const MS_FANTASY_TIERS = ["A", "B", "C", "D", "E"] as const;
export type MsFantasyTier = (typeof MS_FANTASY_TIERS)[number];

export function salaryForTier(tier: string, position?: string): number {
  const t = tier.trim().toUpperCase();
  const pos = (position ?? "").trim().toUpperCase();
  const table = pos === "G" ? MS_FANTASY_TIER_SALARY_GOALIE : MS_FANTASY_TIER_SALARY_SKATER;
  return table[t] ?? table.E;
}

/** Aktuální oznámení k poolu / soupisce (injury swap apod.). */
export type MsFantasyNotice = {
  id: string;
  title: string;
  body: string;
};

export const MS_FANTASY_ACTIVE_NOTICES: MsFantasyNotice[] = [
  {
    id: "fin-teravainen-granlund-2026",
    title: "Změna soupisky Finska",
    body:
      "Z důvodu zranění nahradil Michael Granlund (útočník, tier A) Teuvo Teräväinen v poolu MS Fantasy. Pokud už máš Teräväinen v sestavě, v aplikaci uvidíš Granlunda — odevzdané sestavy zůstávají platné, soutěž pokračuje.",
  },
];

/** Dny kalendáře MS bez zápasů — v přehledu nezobrazujeme řádek „uzávěrka = první zápas dne“ (u těchto dnů se nehraje). */
export function isMsFantasySchedulePauseDaySlug(slug: string): boolean {
  const s = slug.trim();
  return s === "2026-05-27" || s === "2026-05-29";
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
