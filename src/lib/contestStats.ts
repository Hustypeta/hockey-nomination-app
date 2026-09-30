import {
  getTimeBonusPercentForInstant,
  isNominationSubmissionOpen,
} from "@/lib/contestTimeBonus";
import { isPickemSubmissionOpen } from "@/lib/pickemContest";
import { prisma } from "@/lib/prisma";

export type ContestStatsSnapshot = {
  nominationCount: number | null;
  communityUsersCount: number | null;
  pickemCount: number | null;
  fantasyPlayersCount: number | null;
  contestTimeBonusPercent: number;
  contestSubmissionOpen: boolean;
  pickemSubmissionOpen: boolean;
};

async function safeCount(query: () => Promise<number>): Promise<number | null> {
  try {
    return await query();
  } catch {
    return null;
  }
}

export async function getContestStatsSnapshot(now = new Date()): Promise<ContestStatsSnapshot> {
  const [nominationCount, communityUsersCount, pickemCount, fantasyPlayersCount] = await Promise.all([
    safeCount(() =>
      prisma.user.count({
        where: { contestEntryNominationId: { not: null } },
      }),
    ),
    safeCount(() =>
      prisma.user.count({
        where: { email: { not: null } },
      }),
    ),
    safeCount(() =>
      prisma.pickemEntry.count({
        where: { contestSubmittedAt: { not: null } },
      }),
    ),
    safeCount(() =>
      prisma.user.count({
        where: { msFantasyLineups: { some: {} } },
      }),
    ),
  ]);

  return {
    nominationCount,
    communityUsersCount,
    pickemCount,
    fantasyPlayersCount,
    contestTimeBonusPercent: getTimeBonusPercentForInstant(now),
    contestSubmissionOpen: isNominationSubmissionOpen(now),
    pickemSubmissionOpen: isPickemSubmissionOpen(now),
  };
}
