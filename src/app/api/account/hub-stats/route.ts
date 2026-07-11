import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Agregované počty pro přehled „Můj účet“. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }

    const userId = session.user.id;
    const [nominationsCount, matchLineupsCount, forumPostsCount] = await Promise.all([
      prisma.nomination.count({ where: { userId } }),
      prisma.matchShareLink.count({ where: { userId } }),
      prisma.communityPost.count({
        where: { authorId: userId, status: "PUBLISHED" },
      }),
    ]);

    return NextResponse.json({
      nominationsCount,
      matchLineupsCount,
      savedLineupsCount: matchLineupsCount,
      forumPostsCount,
    });
  } catch (e) {
    console.error("GET /api/account/hub-stats", e);
    return NextResponse.json({ error: "Nepodařilo se načíst statistiky." }, { status: 500 });
  }
}
