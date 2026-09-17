import { NextRequest, NextResponse } from "next/server";
import { withAdminJson } from "@/lib/community/adminRoute";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string; commentId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  return withAdminJson(async () => {
    const { slug, commentId } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { action?: unknown };
    if (body.action !== "hide" && body.action !== "delete") {
      return NextResponse.json({ error: "Neplatná moderační akce." }, { status: 400 });
    }

    const post = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: { id: true, commentCount: true, score: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    const target = await prisma.communityComment.findFirst({
      where: { id: commentId, postId: post.id, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Komentář nenalezen." }, { status: 404 });
    }

    const affectedWhere = {
      postId: post.id,
      status: "PUBLISHED" as const,
      OR: [{ id: target.id }, { parentId: target.id }],
    };
    const affectedCount = await prisma.communityComment.count({ where: affectedWhere });
    const nextStatus = body.action === "hide" ? "HIDDEN" : "DELETED";

    await prisma.$transaction([
      prisma.communityComment.updateMany({
        where: affectedWhere,
        data: { status: nextStatus },
      }),
      prisma.communityPost.update({
        where: { id: post.id },
        data: {
          commentCount: Math.max(0, post.commentCount - affectedCount),
          score: Math.max(0, post.score - affectedCount),
        },
      }),
    ]);

    return NextResponse.json({ ok: true, affectedCount });
  });
}
