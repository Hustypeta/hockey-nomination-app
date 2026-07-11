import type { CommunityPostCategory } from "@prisma/client";
import {
  computeContestLeaderboard,
  type ContestLeaderboardRow,
} from "@/lib/contestLeaderboard";

export function contestWinnerPostDraft(winner: ContestLeaderboardRow): {
  title: string;
  bodyMd: string;
  category: CommunityPostCategory;
  nominationId: string;
} {
  return {
    title: `Vítěz nominační soutěže: ${winner.displayName}`,
    bodyMd: [
      `Gratulujeme **${winner.displayName}** k vítězství v nominační soutěži!`,
      "",
      `Celkem **${winner.points} bodů** podle oficiální soupisky. Níže je vítězná nominace — podívej se, jak vypadá sestava šampiona.`,
    ].join("\n"),
    category: "LINEUP_NOMINATION",
    nominationId: winner.nominationId,
  };
}

export async function fetchContestWinnerForAdmin() {
  const { leaderboard, officialUpdatedAt, maxAchievablePoints } = await computeContestLeaderboard();
  const winner = leaderboard[0] ?? null;
  return {
    winner,
    officialUpdatedAt,
    maxAchievablePoints,
    entryCount: leaderboard.length,
  };
}
