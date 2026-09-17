import { prisma } from "@/lib/prisma";
import type { CommunityAttachmentSnapshotV1 } from "@/lib/community/types";
import {
  computeMsFantasyLeaderboard,
  type FantasyLeaderboardRow,
} from "@/lib/msFantasyLeaderboard";

/** Výchozí plakát vítěze fantasy (admin endpoint). */
export const FANTASY_WINNER_DEFAULT_IMAGE_URL = "/images/forum/fantasy-winner-ms2026.png";

export type FantasyWinnerStats = {
  lineupCount: number;
  avgPointsPerDay: number;
  bestDayPoints: number;
  mostPickedPlayerName: string | null;
};

export function fantasyWinnerPostDraft(
  _winner: FantasyLeaderboardRow,
  _stats: FantasyWinnerStats
): {
  title: string;
  bodyMd: string;
  category: "CONTESTS";
  imageUrl: string;
} {
  return {
    title: "Vítěz Daily Fantasy MS 2026: Filip K.",
    bodyMd: "Gratulujeme Filipu K. k vítězství v Daily Fantasy MS 2026!",
    category: "CONTESTS",
    imageUrl: FANTASY_WINNER_DEFAULT_IMAGE_URL,
  };
}

export function buildFantasyWinnerImageSnapshot(imageUrl: string, alt?: string): CommunityAttachmentSnapshotV1 {
  return {
    version: 1,
    kind: "INLINE_SNAPSHOT",
    title: alt ?? "Vítěz Daily Fantasy",
    meta: {
      imageUrl,
      imageAlt: alt ?? "Vítěz Daily Fantasy MS 2026",
    },
  };
}

async function computeMostPickedFantasyPlayerName(): Promise<string | null> {
  const lineups = await prisma.msFantasyLineup.findMany({ select: { pickIds: true } });
  if (lineups.length === 0) return null;

  const counts = new Map<string, number>();
  for (const lineup of lineups) {
    for (const pickId of lineup.pickIds) {
      counts.set(pickId, (counts.get(pickId) ?? 0) + 1);
    }
  }

  let topId: string | null = null;
  let topCount = 0;
  for (const [id, count] of counts) {
    if (count > topCount) {
      topId = id;
      topCount = count;
    }
  }
  if (!topId) return null;

  const player = await prisma.msFantasyRosterPlayer.findUnique({
    where: { id: topId },
    select: { name: true },
  });
  return player?.name ?? null;
}

export async function fetchFantasyWinnerForAdmin() {
  const { updatedAt, leaderboard } = await computeMsFantasyLeaderboard();
  const winner = leaderboard[0] ?? null;

  if (!winner) {
    return {
      winner: null,
      updatedAt,
      entryCount: 0,
      stats: null as FantasyWinnerStats | null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: winner.userId },
    select: { leaderboardNickname: true, name: true },
  });
  const adminDisplayName =
    user?.leaderboardNickname?.trim() || user?.name?.trim() || winner.displayName;

  const lineupCount = await prisma.msFantasyLineup.count({ where: { userId: winner.userId } });
  const bestDayPoints = winner.days.reduce((max, d) => Math.max(max, d.points), 0);
  const avgPointsPerDay = winner.daysPlayed > 0 ? winner.totalPoints / winner.daysPlayed : 0;
  const mostPickedPlayerName = await computeMostPickedFantasyPlayerName();

  const stats: FantasyWinnerStats = {
    lineupCount,
    avgPointsPerDay: Math.round(avgPointsPerDay * 10) / 10,
    bestDayPoints,
    mostPickedPlayerName,
  };

  return {
    winner: { ...winner, displayName: adminDisplayName },
    updatedAt,
    entryCount: leaderboard.length,
    stats,
  };
}
