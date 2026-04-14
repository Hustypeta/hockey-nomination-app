import { NextResponse } from "next/server";
import { scoreNominationAgainstOfficial } from "@/lib/contestScoring";
import { prisma } from "@/lib/prisma";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

const OFFICIAL_ID = "official";

export async function GET() {
  try {
    const official = await prisma.officialLineup.findUnique({ where: { id: OFFICIAL_ID } });
    if (!official?.lineupStructure) {
      return NextResponse.json({
        published: false,
        updatedAt: null as string | null,
        leaderboard: [] as Array<{
          nominationId: string;
          userId: string;
          displayName: string;
          image: string | null;
          points: number;
          createdAt: string;
          breakdown: {
            basePlayerPoints: number;
            playerPointsAfterTimeBonus: number;
            captainBonus: number;
            assistantBonus: number;
            timeBonusPercent: number;
          };
        }>,
      });
    }

    const officialLineup = normalizeLineupStructure(official.lineupStructure as unknown as LineupStructure);

    const nominations = await prisma.nomination.findMany({
      where: {
        userId: { not: null },
        contestEntryForUser: { isNot: null },
      },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const rows: Array<{
      nominationId: string;
      userId: string;
      displayName: string;
      image: string | null;
      points: number;
      createdAt: string;
      breakdown: {
        basePlayerPoints: number;
        playerPointsAfterTimeBonus: number;
        captainBonus: number;
        assistantBonus: number;
        timeBonusPercent: number;
      };
    }> = [];

    for (const n of nominations) {
      if (!n.userId || !n.lineupStructure || !n.user) continue;
      const ls = normalizeLineupStructure(n.lineupStructure as unknown as LineupStructure);
      if (!isLineupComplete(ls)) continue;

      const breakdown = scoreNominationAgainstOfficial(
        ls,
        officialLineup,
        n.captainId,
        official.captainId,
        n.timeBonusPercent
      );

      const displayName =
        n.user.name?.trim() ||
        n.user.email?.split("@")[0]?.trim() ||
        "Hráč";

      rows.push({
        nominationId: n.id,
        userId: n.userId,
        displayName,
        image: n.user.image ?? null,
        points: breakdown.totalPoints,
        createdAt: n.createdAt.toISOString(),
        breakdown: {
          basePlayerPoints: breakdown.basePlayerPoints,
          playerPointsAfterTimeBonus: breakdown.playerPointsAfterTimeBonus,
          captainBonus: breakdown.captainBonus,
          assistantBonus: breakdown.assistantBonus,
          timeBonusPercent: breakdown.timeBonusPercent,
        },
      });
    }

    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));

    return NextResponse.json({
      published: true,
      updatedAt: official.updatedAt.toISOString(),
      leaderboard: ranked,
    });
  } catch (e) {
    console.error("leaderboard:", e);
    return NextResponse.json({ error: "Žebříček se nepodařilo načíst." }, { status: 500 });
  }
}
