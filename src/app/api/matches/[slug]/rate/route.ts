import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const match = await prisma.match.findUnique({ where: { slug }, include: { officialLineup: true } });
    if (!match || !match.published || !match.officialLineup) {
      return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }
    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;
    const playerId = typeof b.playerId === "string" ? b.playerId.trim() : "";
    const ratingRaw = typeof b.rating === "number" ? b.rating : Number(b.rating);
    const rating = Number.isFinite(ratingRaw) ? Math.round(ratingRaw) : NaN;
    if (!playerId) return NextResponse.json({ error: "Chybí hráč." }, { status: 400 });
    if (!(rating >= 1 && rating <= 10)) {
      return NextResponse.json({ error: "Hodnocení musí být 1–10." }, { status: 400 });
    }

    const raterKey = `u:${userId}`;

    await prisma.matchRating.upsert({
      where: { matchId_playerId_raterKey: { matchId: match.id, playerId, raterKey } },
      create: { matchId: match.id, playerId, raterKey, rating },
      update: { rating },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/matches/[slug]/rate:", e);
    return NextResponse.json({ error: "Chyba." }, { status: 500 });
  }
}

