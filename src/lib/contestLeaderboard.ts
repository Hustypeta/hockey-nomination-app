import { scoreNominationAgainstOfficial } from "@/lib/contestScoring";
import { prisma } from "@/lib/prisma";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

const OFFICIAL_ID = "official";

export type ContestLeaderboardBreakdown = {
  basePlayerPoints: number;
  playerPointsAfterTimeBonus: number;
  captainBonus: number;
  assistantBonus: number;
  timeBonusPercent: number;
};

export type ContestLeaderboardRow = {
  rank: number;
  nominationId: string;
  userId: string;
  displayName: string;
  points: number;
  createdAt: string;
  breakdown: ContestLeaderboardBreakdown;
};

function isRemoteDeployment(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RENDER ||
      process.env.FLY_APP_NAME
  );
}

/** Zapne fanouškovské čtení žebříčku (`CONTEST_LEADERBOARD_PUBLIC=true`). */
export function contestLeaderboardWantsPublic(): boolean {
  return process.env.CONTEST_LEADERBOARD_PUBLIC?.trim().toLowerCase() === "true";
}

export function contestLeaderboardForceOff(): boolean {
  return process.env.CONTEST_LEADERBOARD_FORCE_OFF?.trim().toLowerCase() === "true";
}

export function contestLeaderboardLiveGateOk(): boolean {
  if (!isRemoteDeployment()) return true;
  return process.env.CONTEST_LEADERBOARD_LIVE?.trim().toLowerCase() === "true";
}

/** Veřejné zobrazení bez admin cookie. */
export function contestLeaderboardIsPublic(): boolean {
  if (contestLeaderboardForceOff()) return false;
  if (!contestLeaderboardLiveGateOk()) return false;
  return contestLeaderboardWantsPublic();
}

export async function computeContestLeaderboard(): Promise<{
  officialUpdatedAt: string | null;
  leaderboard: ContestLeaderboardRow[];
}> {
  const official = await prisma.officialLineup.findUnique({ where: { id: OFFICIAL_ID } });
  if (!official?.lineupStructure) {
    return { officialUpdatedAt: null, leaderboard: [] };
  }

  const officialLineup = normalizeLineupStructure(official.lineupStructure as unknown as LineupStructure);

  const nominations = await prisma.nomination.findMany({
    where: {
      userId: { not: null },
      contestEntryForUser: { isNot: null },
    },
    include: {
      user: { select: { id: true, leaderboardNickname: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: Omit<ContestLeaderboardRow, "rank">[] = [];

  for (const n of nominations) {
    if (!n.userId || !n.lineupStructure || !n.user) continue;
    const ls = normalizeLineupStructure(n.lineupStructure as unknown as LineupStructure);
    if (!isLineupComplete(ls)) continue;

    const breakdown = scoreNominationAgainstOfficial(
      ls,
      officialLineup,
      n.captainId,
      official.captainId,
      n.timeBonusPercent
    );

    rows.push({
      nominationId: n.id,
      userId: n.userId,
      displayName: publicLeaderboardDisplayName({
        userId: n.userId,
        nickname: n.user.leaderboardNickname,
      }),
      points: breakdown.totalPoints,
      createdAt: n.createdAt.toISOString(),
      breakdown: {
        basePlayerPoints: breakdown.basePlayerPoints,
        playerPointsAfterTimeBonus: breakdown.playerPointsAfterTimeBonus,
        captainBonus: breakdown.captainBonus,
        assistantBonus: breakdown.assistantBonus,
        timeBonusPercent: breakdown.timeBonusPercent,
      },
    });
  }

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    officialUpdatedAt: official.updatedAt.toISOString(),
    leaderboard: rows.map((r, i) => ({ rank: i + 1, ...r })),
  };
}
