import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";

function normalizeNickname(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const n = raw.trim().replace(/\s+/g, " ");
  if (!n) return null;
  if (n.length < 2) return null;
  if (n.length > 24) return null;
  return n;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { leaderboardNickname: true },
    });

    return NextResponse.json({
      nickname: user?.leaderboardNickname ?? null,
      displayName: publicLeaderboardDisplayName({
        userId,
        nickname: user?.leaderboardNickname ?? null,
      }),
    });
  } catch (e) {
    console.error("GET /api/account/leaderboard-nickname", e);
    return NextResponse.json({ error: "Nepodařilo se načíst profil." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as unknown;
    const raw = body && typeof body === "object" ? (body as Record<string, unknown>).nickname : null;
    const nickname = normalizeNickname(raw);
    if (raw !== null && raw !== undefined && typeof raw !== "string") {
      return NextResponse.json({ error: "Neplatná přezdívka." }, { status: 400 });
    }
    if (typeof raw === "string" && raw.trim() && !nickname) {
      return NextResponse.json({ error: "Přezdívka musí mít 2–24 znaků." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { leaderboardNickname: nickname },
      select: { leaderboardNickname: true },
    });

    return NextResponse.json({
      ok: true,
      nickname: user.leaderboardNickname ?? null,
      displayName: publicLeaderboardDisplayName({
        userId,
        nickname: user.leaderboardNickname ?? null,
      }),
    });
  } catch (e) {
    console.error("PATCH /api/account/leaderboard-nickname", e);
    return NextResponse.json({ error: "Uložení se nepovedlo." }, { status: 500 });
  }
}

