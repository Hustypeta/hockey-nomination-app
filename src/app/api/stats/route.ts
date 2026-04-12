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
    const nominationCount = await prisma.nomination.count();
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
