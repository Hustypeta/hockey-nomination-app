import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTimeBonusPercentForInstant,
  isNominationSubmissionOpen,
} from "@/lib/contestTimeBonus";
import { isPickemSubmissionOpen } from "@/lib/pickemContest";

export const dynamic = "force-dynamic";

/**
 * Veřejné statistiky pro landing (konverze / social proof) + stav časového bonusu.
 * Pick’emy = jen účty, které jednou odeslaly tip do soutěže (`contestSubmittedAt`), ne rozpracované koncepty.
 */
export async function GET() {
  try {
    const now = new Date();
    /** Počet účtů, které už odeslaly nominaci do soutěže (ne počet konceptů). */
    const [nominationCount, communityUsersCount, pickemCount, fantasyPlayersCount] = await Promise.all([
      prisma.user.count({
        where: { contestEntryNominationId: { not: null } },
      }),
      // “Komunita” = účty, které se aspoň jednou přihlásily (email vyplněn z provideru).
      prisma.user.count({
        where: { email: { not: null } },
      }),
      prisma.pickemEntry.count({
        where: { contestSubmittedAt: { not: null } },
      }),
      /** Unikátní účty s alespoň jednou uloženou fantasy sestavou (ne počet odevzdání). */
      prisma.user.count({
        where: { msFantasyLineups: { some: {} } },
      }),
    ]);
    return NextResponse.json({
      nominationCount,
      communityUsersCount,
      pickemCount,
      fantasyPlayersCount,
      contestTimeBonusPercent: getTimeBonusPercentForInstant(now),
      contestSubmissionOpen: isNominationSubmissionOpen(now),
      pickemSubmissionOpen: isPickemSubmissionOpen(now),
    });
  } catch {
    return NextResponse.json({
      nominationCount: null as number | null,
      communityUsersCount: null as number | null,
      pickemCount: null as number | null,
      fantasyPlayersCount: null as number | null,
      contestTimeBonusPercent: 0,
      contestSubmissionOpen: true,
      pickemSubmissionOpen: false,
    });
  }
}
