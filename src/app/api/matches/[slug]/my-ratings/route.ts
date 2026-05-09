import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Vrátí všechny moje (přihlášený uživatel) hodnocení pro daný zápas. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ ratings: {} as Record<string, number> });
    }
    const match = await prisma.match.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });
    if (!match || !match.published) {
      return NextResponse.json({ ratings: {} as Record<string, number> });
    }
    const rows = await prisma.matchRating.findMany({
      where: { matchId: match.id, raterKey: `u:${userId}` },
      select: { playerId: true, rating: true },
    });
    const ratings: Record<string, number> = {};
    for (const r of rows) ratings[r.playerId] = r.rating;
    return NextResponse.json({ ratings });
  } catch (e) {
    console.error("GET /api/matches/[slug]/my-ratings:", e);
    return NextResponse.json({ ratings: {} as Record<string, number> });
  }
}
