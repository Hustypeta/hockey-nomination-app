import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTimeBonusPercentForInstant,
  isNominationSubmissionOpen,
} from "@/lib/contestTimeBonus";

export const dynamic = "force-dynamic";

/**
 * Veřejné statistiky pro landing (konverze / social proof) + stav časového bonusu.
 */
export async function GET() {
  try {
    const now = new Date();
    /** Počet účtů, které už odeslaly nominaci do soutěže (ne počet konceptů). */
    const nominationCount = await prisma.user.count({
      where: { contestEntryNominationId: { not: null } },
    });
    return NextResponse.json({
      nominationCount,
      contestTimeBonusPercent: getTimeBonusPercentForInstant(now),
      contestSubmissionOpen: isNominationSubmissionOpen(now),
    });
  } catch {
    return NextResponse.json({
      nominationCount: null as number | null,
      contestTimeBonusPercent: 0,
      contestSubmissionOpen: true,
    });
  }
}
