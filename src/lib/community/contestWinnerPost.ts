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
    title: "Vítěz nominační soutěže MS 2026: Matěj K.",
    bodyMd:
      "Gratulujeme Matěji K. k vítězství v Nominační soutěži MS 2026, ve které získal neuvěřitelných 129 bodů ze 193.",
    category: "CONTESTS",
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
