import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomCode } from "@/lib/randomCode";

const ANON_COOKIE = "match_rater";

function getOrSetAnonRaterKey(): { raterKey: string; setCookie?: string } {
  const c = cookies().get(ANON_COOKIE)?.value?.trim();
  if (c && c.length >= 8) return { raterKey: `a:${c}` };
  const next = randomCode(18);
  return { raterKey: `a:${next}`, setCookie: next };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const match = await prisma.match.findUnique({ where: { slug }, include: { officialLineup: true } });
    if (!match || !match.published || !match.officialLineup) {
      return NextResponse.json({ error: "Zápas nenalezen." }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const body: unknown = await request.json().catch(() => ({}));
    const b = (body ?? {}) as Record<string, unknown>;
    const playerId = typeof b.playerId === "string" ? b.playerId.trim() : "";
    const ratingRaw = typeof b.rating === "number" ? b.rating : Number(b.rating);
    const rating = Number.isFinite(ratingRaw) ? Math.round(ratingRaw) : NaN;
    if (!playerId) return NextResponse.json({ error: "Chybí hráč." }, { status: 400 });
    if (!(rating >= 1 && rating <= 10)) {
      return NextResponse.json({ error: "Hodnocení musí být 1–10." }, { status: 400 });
    }

    const anon = session?.user?.id ? null : getOrSetAnonRaterKey();
    const raterKey = session?.user?.id ? `u:${session.user.id}` : anon.raterKey;

    await prisma.matchRating.upsert({
      where: { matchId_playerId_raterKey: { matchId: match.id, playerId, raterKey } },
      create: { matchId: match.id, playerId, raterKey, rating },
      update: { rating },
    });

    const res = NextResponse.json({ ok: true });
    if (anon?.setCookie) {
      res.cookies.set(ANON_COOKIE, anon.setCookie, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 180 * 24 * 3600,
        path: "/",
      });
    }
    return res;
  } catch (e) {
    console.error("POST /api/matches/[slug]/rate:", e);
    return NextResponse.json({ error: "Chyba." }, { status: 500 });
  }
}

