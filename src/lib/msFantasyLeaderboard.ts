import { prisma } from "@/lib/prisma";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";

export type FantasyLeaderboardDayPoints = {
  slug: string;
  title: string;
  points: number;
};

export type FantasyLeaderboardRow = {
  rank: number;
  userId: string;
  displayName: string;
  totalPoints: number;
  daysPlayed: number;
  days: FantasyLeaderboardDayPoints[];
};

export function msFantasyLeaderboardForceOff(): boolean {
  return process.env.MS_FANTASY_LEADERBOARD_FORCE_OFF?.trim().toLowerCase() === "true";
}

function envFlag(name: string): boolean | null {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

/** Veřejné zobrazení fantasy žebříčku (výchozí zapnuto). */
export function msFantasyLeaderboardIsPublic(): boolean {
  if (msFantasyLeaderboardForceOff()) return false;
  if (envFlag("MS_FANTASY_LEADERBOARD_PUBLIC") === false) return false;
  return true;
}

/** Celkové pořadí fantasy — součet bodů ze všech vyhodnocených dnů. */
export async function computeMsFantasyLeaderboard(): Promise<{
  updatedAt: string | null;
  leaderboard: FantasyLeaderboardRow[];
}> {
  const rows = await prisma.msFantasyLineupDayResult.findMany({
    include: {
      gameDay: { select: { slug: true, title: true, sortOrder: true } },
    },
    orderBy: [{ gameDay: { sortOrder: "asc" } }, { points: "desc" }],
  });

  if (rows.length === 0) {
    return { updatedAt: null, leaderboard: [] };
  }

  const userIds = [...new Set(rows.map((r) => r.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, leaderboardNickname: true },
  });
  const nicknameByUserId = new Map(users.map((u) => [u.id, u.leaderboardNickname]));

  let latestScoredAt: Date | null = null;
  const byUser = new Map<
    string,
    { displayName: string; totalPoints: number; days: FantasyLeaderboardDayPoints[] }
  >();

  for (const row of rows) {
    if (row.scoredAt && (!latestScoredAt || row.scoredAt > latestScoredAt)) {
      latestScoredAt = row.scoredAt;
    }

    const cur = byUser.get(row.userId) ?? {
      displayName: publicLeaderboardDisplayName({
        userId: row.userId,
        nickname: nicknameByUserId.get(row.userId),
      }),
      totalPoints: 0,
      days: [],
    };
    cur.totalPoints += row.points;
    cur.days.push({
      slug: row.gameDay.slug,
      title: row.gameDay.title,
      points: row.points,
    });
    byUser.set(row.userId, cur);
  }

  const sorted = [...byUser.entries()].sort(
    (a, b) =>
      b[1].totalPoints - a[1].totalPoints ||
      a[1].displayName.localeCompare(b[1].displayName, "cs"),
  );

  const leaderboard: FantasyLeaderboardRow[] = sorted.map(([userId, agg], i) => ({
    rank: i + 1,
    userId,
    displayName: agg.displayName,
    totalPoints: agg.totalPoints,
    daysPlayed: agg.days.length,
    days: agg.days,
  }));

  return {
    updatedAt: latestScoredAt?.toISOString() ?? null,
    leaderboard,
  };
}
