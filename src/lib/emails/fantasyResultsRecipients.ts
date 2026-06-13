import { computeMsFantasyLeaderboard } from "@/lib/msFantasyLeaderboard";
import { prisma } from "@/lib/prisma";

export type FantasyResultsRecipient = {
  email: string;
  userId: string;
  displayName: string;
  points: number;
  rank: number;
};

/** Účastníci fantasy s e‑mailem a pořadím pro personalizovaný rozesíl. */
export async function listFantasyResultsRecipients(): Promise<FantasyResultsRecipient[]> {
  const { leaderboard } = await computeMsFantasyLeaderboard();
  if (!leaderboard.length) return [];

  const userIds = leaderboard.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, email: { not: null } },
    select: { id: true, email: true },
  });

  const emailByUserId = new Map(
    users.map((u) => [u.id, (u.email ?? "").trim()] as const).filter(([, e]) => Boolean(e)),
  );

  const out: FantasyResultsRecipient[] = [];
  for (const row of leaderboard) {
    const email = emailByUserId.get(row.userId);
    if (!email) continue;
    out.push({
      email,
      userId: row.userId,
      displayName: row.displayName,
      points: row.totalPoints,
      rank: row.rank,
    });
  }
  return out;
}
