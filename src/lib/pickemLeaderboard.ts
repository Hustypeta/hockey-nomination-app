import { parseBracketPickemPayload } from "@/lib/bracketPayload";
import { scorePickemAgainstOfficial, type PickemScoreBreakdown } from "@/lib/pickemScoring";
import { prisma } from "@/lib/prisma";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";
import type { BracketPickemPayload } from "@/types/bracketPickem";

export const OFFICIAL_PICKEM_ID = "official";

export type PickemLeaderboardRow = {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  contestSubmittedAt: string;
  breakdown: PickemScoreBreakdown;
};

export type PickemLeaderboardPublicRow = {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
};

export function pickemLeaderboardForceOff(): boolean {
  return process.env.PICKEM_LEADERBOARD_FORCE_OFF?.trim().toLowerCase() === "true";
}

function envFlag(name: string): boolean | null {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

/** Veřejné zobrazení pick'em žebříčku (výchozí zapnuto po uložení oficiálních výsledků). */
export function pickemLeaderboardIsPublic(): boolean {
  if (pickemLeaderboardForceOff()) return false;
  if (envFlag("PICKEM_LEADERBOARD_PUBLIC") === false) return false;
  return true;
}

export async function loadOfficialPickemPayload(): Promise<{
  payload: BracketPickemPayload;
  updatedAt: string;
} | null> {
  const row = await prisma.officialPickem.findUnique({ where: { id: OFFICIAL_PICKEM_ID } });
  if (!row?.payload) return null;
  const payload = parseBracketPickemPayload(row.payload);
  if (!payload) return null;
  return { payload, updatedAt: row.updatedAt.toISOString() };
}

/** Vyhodnotí všechny soutěžní Pick'em záznamy proti oficiálním výsledkům. */
export async function computePickemLeaderboard(): Promise<{
  officialUpdatedAt: string | null;
  entriesTotal: number;
  entriesEvaluated: number;
  entriesSkipped: number;
  leaderboard: PickemLeaderboardRow[];
}> {
  const official = await loadOfficialPickemPayload();
  if (!official) {
    return {
      officialUpdatedAt: null,
      entriesTotal: 0,
      entriesEvaluated: 0,
      entriesSkipped: 0,
      leaderboard: [],
    };
  }

  const entries = await prisma.pickemEntry.findMany({
    where: { contestSubmittedAt: { not: null } },
    include: {
      user: { select: { id: true, leaderboardNickname: true } },
    },
    orderBy: { contestSubmittedAt: "asc" },
  });

  const rows: Omit<PickemLeaderboardRow, "rank">[] = [];
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.contestSubmittedAt || !entry.user) {
      skipped++;
      continue;
    }
    const userPayload = parseBracketPickemPayload(entry.payload);
    if (!userPayload) {
      skipped++;
      continue;
    }

    const breakdown = scorePickemAgainstOfficial(userPayload, official.payload);
    rows.push({
      userId: entry.userId,
      displayName: publicLeaderboardDisplayName({
        userId: entry.userId,
        nickname: entry.user.leaderboardNickname,
      }),
      points: breakdown.totalPoints,
      contestSubmittedAt: entry.contestSubmittedAt.toISOString(),
      breakdown,
    });
  }

  rows.sort(
    (a, b) =>
      b.points - a.points ||
      a.contestSubmittedAt.localeCompare(b.contestSubmittedAt) ||
      a.displayName.localeCompare(b.displayName, "cs"),
  );

  const leaderboard: PickemLeaderboardRow[] = rows.map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    officialUpdatedAt: official.updatedAt,
    entriesTotal: entries.length,
    entriesEvaluated: leaderboard.length,
    entriesSkipped: skipped,
    leaderboard,
  };
}
