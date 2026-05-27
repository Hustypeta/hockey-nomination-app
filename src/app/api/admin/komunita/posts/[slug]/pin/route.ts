import { NextRequest, NextResponse } from "next/server";
import { withAdminJson } from "@/lib/community/adminRoute";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

/** Připnutí příspěvku (jen admin cookie, bez kontroly autora). */
export async function POST(req: NextRequest, ctx: Ctx) {
  return withAdminJson(async () => {
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { pinned?: boolean };
    const pinned = body.pinned !== false;

    const row = await prisma.communityPost.findFirst({ where: { slug, deletedAt: null } });
    if (!row) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    const updated = await prisma.communityPost.update({
      where: { id: row.id },
      data: { pinnedAt: pinned ? new Date() : null },
      select: { pinnedAt: true },
    });

    return NextResponse.json({
      pinned: !!updated.pinnedAt,
      pinnedAt: updated.pinnedAt?.toISOString() ?? null,
    });
  });
}
