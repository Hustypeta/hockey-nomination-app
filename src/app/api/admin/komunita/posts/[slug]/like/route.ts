import { NextRequest, NextResponse } from "next/server";
import { withAdminJson, requireUserId } from "@/lib/community/adminRoute";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  return withAdminJson(async ({ userId }) => {
    const uid = requireUserId(userId);
    const { slug } = await ctx.params;
    const post = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: { id: true, likeCount: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    const existing = await prisma.communityPostLike.findUnique({
      where: { userId_postId: { userId: uid, postId: post.id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.communityPostLike.delete({
          where: { userId_postId: { userId: uid, postId: post.id } },
        }),
        prisma.communityPost.update({
          where: { id: post.id },
          data: { likeCount: { decrement: 1 }, score: { decrement: 2 } },
        }),
      ]);
      return NextResponse.json({ liked: false, likeCount: Math.max(0, post.likeCount - 1) });
    }

    await prisma.$transaction([
      prisma.communityPostLike.create({ data: { userId: uid, postId: post.id } }),
      prisma.communityPost.update({
        where: { id: post.id },
        data: { likeCount: { increment: 1 }, score: { increment: 2 } },
      }),
    ]);
    return NextResponse.json({ liked: true, likeCount: post.likeCount + 1 });
  });
}
