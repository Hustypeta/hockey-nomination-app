import { computeContestLeaderboard } from "@/lib/contestLeaderboard";
import { prisma } from "@/lib/prisma";

export type ContestResultsRecipient = {
  email: string;
  userId: string;
  displayName: string;
  points: number;
  rank: number;
};

/** Účastníci soutěže s e‑mailem a pořadím pro personalizovaný rozesíl. */
export async function listContestResultsRecipients(): Promise<ContestResultsRecipient[]> {
  const { leaderboard } = await computeContestLeaderboard();
  if (!leaderboard.length) return [];

  const userIds = leaderboard.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, email: { not: null } },
    select: { id: true, email: true },
  });

  const emailByUserId = new Map(
    users.map((u) => [u.id, (u.email ?? "").trim()] as const).filter(([, e]) => Boolean(e))
  );

  const out: ContestResultsRecipient[] = [];
  for (const row of leaderboard) {
    const email = emailByUserId.get(row.userId);
    if (!email) continue;
    out.push({
      email,
      userId: row.userId,
      displayName: row.displayName,
      points: row.points,
      rank: row.rank,
    });
  }
  return out;
}
