import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function loadRatingsOpenFlag(matchId: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ ratingsOpen: boolean | null }>>`
      SELECT "ratingsOpen" FROM "matches" WHERE id = ${matchId}
    `;
    return Boolean(rows[0]?.ratingsOpen);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const match = await prisma.match.findUnique({
      where: { slug },
      select: {
        id: true,
        published: true,
        startsAt: true,
        officialLineup: { select: { matchId: true } },
      },
    });
    if (!match || !match.published || !match.officialLineup) {
      return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    }
    const ratingsOpen = await loadRatingsOpenFlag(match.id);
    if (!ratingsOpen) {
      return NextResponse.json(
        { error: "Hodnocení zatím nebylo spuštěno administrátorem." },
        { status: 403 }
      );
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
    /** Zaokrouhlíme na desetinu (1.0 – 10.0 v krocích po 0.1). */
    const rating = Number.isFinite(ratingRaw) ? Math.round(ratingRaw * 10) / 10 : NaN;
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
    const message = e instanceof Error ? `Chyba: ${e.message}` : "Chyba.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

