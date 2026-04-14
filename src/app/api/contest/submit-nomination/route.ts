import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateNominationPayload } from "@/lib/nominationPayloadServer";
import {
  getTimeBonusPercentForInstant,
  isNominationSubmissionOpen,
} from "@/lib/contestTimeBonus";

/**
 * Jednorázové odeslání sestavy do soutěže (jeden řádek na uživatele).
 * Zapisuje časový bonus podle okamžiku odeslání.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro odeslání do soutěže se musíš přihlásit přes Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = validateNominationPayload(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { selectedPlayerIds, captainId, lineupStructure, title } = parsed.payload;

    const now = new Date();
    if (!isNominationSubmissionOpen(now)) {
      return NextResponse.json(
        {
          error:
            "Uzávěrka soutěže už proběhla (13. 5. 2026 23:59). Nominaci do soutěže už nelze odeslat.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contestEntryNominationId: true },
    });

    if (existing?.contestEntryNominationId) {
      return NextResponse.json(
        { error: "Do soutěže už jsi ze svého účtu nominaci odeslal — znovu to nejde." },
        { status: 400 }
      );
    }

    const timeBonusPercent = getTimeBonusPercentForInstant(now);

    const result = await prisma.$transaction(async (tx) => {
      const nomination = await tx.nomination.create({
        data: {
          userId: session.user.id,
          selectedPlayerIds,
          captainId,
          lineupStructure: lineupStructure ?? undefined,
          timeBonusPercent,
          title,
        },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data: { contestEntryNominationId: nomination.id },
      });
      return nomination;
    });

    return NextResponse.json({
      id: result.id,
      message: "Nominace je v soutěži",
      createdAt: result.createdAt.toISOString(),
      timeBonusPercent: result.timeBonusPercent,
    });
  } catch (e) {
    console.error("POST /api/contest/submit-nomination:", e);
    return NextResponse.json({ error: "Odeslání se nepovedlo." }, { status: 500 });
  }
}
