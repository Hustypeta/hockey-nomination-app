import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminJson, requireUserId } from "@/lib/community/adminRoute";
import type { MyLineupPick } from "@/lib/community/types";

export async function GET() {
  return withAdminJson(async ({ userId }) => {
    const uid = requireUserId(userId);
    const [nominations, matchLinks, fantasy] = await Promise.all([
      prisma.nomination.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, title: true, slug: true, createdAt: true },
      }),
      prisma.matchShareLink.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { code: true, title: true, slug: true, createdAt: true },
      }),
      prisma.msFantasyLineup.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { gameDay: { select: { title: true } } },
      }),
    ]);

    const picks: MyLineupPick[] = [
      ...nominations.map((n) => ({
        kind: "NOMINATION" as const,
        id: n.id,
        title: n.title?.trim() || "Nominace bez názvu",
        slug: n.slug,
        createdAt: n.createdAt.toISOString(),
      })),
      ...matchLinks.map((m) => ({
        kind: "MATCH_LINEUP" as const,
        id: m.code,
        title: m.title?.trim() || "Zápasová sestava",
        slug: m.slug,
        createdAt: m.createdAt.toISOString(),
      })),
      ...fantasy.map((f) => ({
        kind: "FANTASY_LINEUP" as const,
        id: f.id,
        title: f.gameDay.title,
        createdAt: f.createdAt.toISOString(),
        meta: `${f.pickIds.length} hráčů · ${f.salarySpent} kreditů`,
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ picks });
  });
}
