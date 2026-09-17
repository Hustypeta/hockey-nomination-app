import { NextRequest, NextResponse } from "next/server";
import { withAdminJson } from "@/lib/community/adminRoute";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  return withAdminJson(async () => {
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { action?: unknown };
    if (body.action !== "hide") {
      return NextResponse.json({ error: "Neplatná moderační akce." }, { status: 400 });
    }

    const post = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    await prisma.communityPost.update({
      where: { id: post.id },
      data: { status: "HIDDEN" },
    });

    return NextResponse.json({ ok: true });
  });
}
