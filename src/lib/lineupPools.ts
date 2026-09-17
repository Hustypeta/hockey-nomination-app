/** Pool keys for match lineup editor (Excel sheets → DB → UI). */

export const REPRE_POOLS = [
  { key: "repre_a", label: "A tým", sheet: "A-tym" },
  { key: "repre_u20", label: "U20", sheet: "U20" },
  { key: "repre_u18", label: "U18", sheet: "U18" },
  { key: "repre_zeny", label: "Ženy", sheet: "Zeny" },
] as const;

export type ReprePoolKey = (typeof REPRE_POOLS)[number]["key"];

/** Canonical Extraliha club names (must match Livesport / Excel `klub`). */
export const ELH_CLUBS = [
  "BK Mladá Boleslav",
  "Bílí Tygři Liberec",
  "HC Dynamo Pardubice",
  "HC Energie Karlovy Vary",
  "HC Kometa Brno",
  "HC Litvínov",
  "HC Motor České Budějovice",
  "HC Oceláři Třinec",
  "HC Olomouc",
  "HC Plzeň",
  "HC Sparta Praha",
  "HC Vítkovice",
  "Mountfield HK",
  "Rytíři Kladno",
] as const;

export type ElhClub = (typeof ELH_CLUBS)[number];

export function elhPoolKey(club: string): string {
  return `elh:${club.trim()}`;
}

export function isElhPoolKey(poolKey: string): boolean {
  return poolKey.startsWith("elh:");
}

export function clubFromElhPoolKey(poolKey: string): string | null {
  if (!isElhPoolKey(poolKey)) return null;
  return poolKey.slice(4).trim() || null;
}

/** Short Excel sheet title for a club (≤31 chars). */
export function elhClubSheetName(club: string): string {
  const map: Record<string, string> = {
    "BK Mladá Boleslav": "MLB",
    "Bílí Tygři Liberec": "LIB",
    "HC Dynamo Pardubice": "PCE",
    "HC Energie Karlovy Vary": "KVA",
    "HC Kometa Brno": "BRN",
    "HC Litvínov": "LIT",
    "HC Motor České Budějovice": "CEB",
    "HC Oceláři Třinec": "TRI",
    "HC Olomouc": "OLM",
    "HC Plzeň": "PLZ",
    "HC Sparta Praha": "SPA",
    "HC Vítkovice": "VIT",
    "Mountfield HK": "MHK",
    "Rytíři Kladno": "KLA",
  };
  return map[club.trim()] ?? club.trim().slice(0, 31);
}

export function elhClubFromSheetName(sheet: string): string | null {
  const t = sheet.trim();
  for (const club of ELH_CLUBS) {
    if (elhClubSheetName(club) === t || club === t) return club;
  }
  return null;
}

export function isKnownPoolKey(poolKey: string): boolean {
  if (REPRE_POOLS.some((p) => p.key === poolKey)) return true;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && (ELH_CLUBS as readonly string[]).includes(club);
}

export const DEFAULT_LINEUP_POOL: ReprePoolKey = "repre_a";

export type LineupPoolOption =
  | { kind: "repre"; key: ReprePoolKey; label: string }
  | { kind: "elh"; key: string; label: string; club: string };

export function allLineupPoolOptions(): LineupPoolOption[] {
  return [
    ...REPRE_POOLS.map((p) => ({ kind: "repre" as const, key: p.key, label: p.label })),
    ...ELH_CLUBS.map((club) => ({
      kind: "elh" as const,
      key: elhPoolKey(club),
      label: club,
      club,
    })),
  ];
}
