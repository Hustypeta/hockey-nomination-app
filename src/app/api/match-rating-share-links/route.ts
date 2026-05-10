import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomCode } from "@/lib/randomCode";
import { uniqueSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;
    const matchSlug = typeof b.matchSlug === "string" ? b.matchSlug.trim() : "";
    const title = typeof b.title === "string" ? b.title.trim() : "";
    if (!matchSlug) return NextResponse.json({ error: "Chybí zápas." }, { status: 400 });

    const match = await prisma.match.findUnique({
      where: { slug: matchSlug },
      include: { officialLineup: true },
    });
    if (!match || !match.published || !match.officialLineup) {
      return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    }

    const snapshotModeRaw = typeof b.snapshotMode === "string" ? b.snapshotMode.trim() : "";
    const snapshotMode: "personal" | "community" =
      snapshotModeRaw === "community" ? "community" : "personal";

    const matchMeta = {
      slug: match.slug,
      title: match.title,
      opponent: match.opponent,
      startsAt: match.startsAt?.toISOString() ?? null,
      venue: match.venue,
      category: match.category,
      homeCode: match.homeCode,
      awayCode: match.awayCode,
    };

    const createdAt = new Date().toISOString();

    let snapshot: object;

    if (snapshotMode === "community") {
      const grouped = await prisma.matchRating.groupBy({
        by: ["playerId"],
        where: { matchId: match.id },
        _avg: { rating: true },
        _count: { rating: true },
      });
      const ratings = Object.fromEntries(
        grouped.map((r) => [r.playerId, { avg: r._avg.rating ?? 0, count: r._count.rating }])
      );
      snapshot = {
        snapshotVersion: 2 as const,
        kind: "community" as const,
        match: matchMeta,
        ratings,
        createdAt,
      };
    } else {
      const mineRows = await prisma.matchRating.findMany({
        where: { matchId: match.id, raterKey: `u:${session.user.id}` },
        select: { playerId: true, rating: true },
      });
      const myRatings = Object.fromEntries(mineRows.map((r) => [r.playerId, r.rating]));
      if (mineRows.length === 0) {
        return NextResponse.json(
          { error: "Nemáš u tohoto zápasu uložené žádné známky — nejdřív si je ulož na stránce zápasu." },
          { status: 400 }
        );
      }
      snapshot = {
        snapshotVersion: 2 as const,
        kind: "personal" as const,
        match: matchMeta,
        myRatings,
        createdAt,
      };
    }

    const slug = await uniqueSlug(title || `hodnoceni-${match.title}`, async (s) => {
      const hit = await prisma.matchRatingShareLink.findUnique({ where: { slug: s }, select: { code: true } });
      return !!hit;
    });

    let code = randomCode(12);
    for (let attempt = 0; attempt < 8; attempt++) {
      const clash = await prisma.matchRatingShareLink.findUnique({ where: { code }, select: { code: true } });
      if (!clash) break;
      code = randomCode(12);
    }

    await prisma.matchRatingShareLink.create({
      data: {
        code,
        slug,
        matchId: match.id,
        title: title || null,
        snapshot: snapshot as object,
      },
    });

    const origin = new URL(request.url).origin;
    const path = `/h/${encodeURIComponent(slug)}`;
    return NextResponse.json({ code, slug, path, url: `${origin}${path}` });
  } catch (e) {
    console.error("POST /api/match-rating-share-links", e);
    return NextResponse.json({ error: "Nepodařilo se vytvořit export." }, { status: 500 });
  }
}
