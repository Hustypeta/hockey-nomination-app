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

export async function getContestStatsSnapshot(now = new Date()): Promise<ContestStatsSnapshot> {
  try {
    const [nominationCount, communityUsersCount, pickemCount, fantasyPlayersCount] = await Promise.all([
      prisma.user.count({
        where: { contestEntryNominationId: { not: null } },
      }),
      prisma.user.count({
        where: { email: { not: null } },
      }),
      prisma.pickemEntry.count({
        where: { contestSubmittedAt: { not: null } },
      }),
      prisma.user.count({
        where: { msFantasyLineups: { some: {} } },
      }),
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
  } catch {
    return {
      nominationCount: null,
      communityUsersCount: null,
      pickemCount: null,
      fantasyPlayersCount: null,
      contestTimeBonusPercent: 0,
      contestSubmissionOpen: true,
      pickemSubmissionOpen: false,
    };
  }
}
