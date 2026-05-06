import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LineupStructure } from "@/types";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const match = await prisma.match.findUnique({
      where: { slug },
      include: { officialLineup: true },
    });
    if (!match || !match.published || !match.officialLineup) {
      return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    }

    const ratings = await prisma.matchRating.groupBy({
      by: ["playerId"],
      where: { matchId: match.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const byPlayer = Object.fromEntries(
      ratings.map((r) => [r.playerId, { avg: r._avg.rating ?? 0, count: r._count.rating }])
    );

    return NextResponse.json({
      match: {
        id: match.id,
        slug: match.slug,
        title: match.title,
        opponent: match.opponent,
        startsAt: match.startsAt?.toISOString() ?? null,
        venue: match.venue,
      },
      official: {
        lineupStructure: match.officialLineup.lineupStructure as unknown as LineupStructure,
        captainId: match.officialLineup.captainId ?? null,
        defenseCount: match.officialLineup.defenseCount,
        allowExtraForward: match.officialLineup.allowExtraForward,
      },
      ratings: byPlayer,
    });
  } catch (e) {
    console.error("GET /api/matches/[slug]:", e);
    return NextResponse.json({ error: "Chyba." }, { status: 500 });
  }
}

