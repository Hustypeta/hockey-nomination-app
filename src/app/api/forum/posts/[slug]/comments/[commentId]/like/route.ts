import { NextRequest, NextResponse } from "next/server";
import { togglePublishedCommentLike } from "@/lib/community/commentLikes";
import { withForumJson, requireForumUser } from "@/lib/community/forumRoute";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; commentId: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  return withForumJson(async ({ userId }) => {
    const uid = requireForumUser(userId);
    const { slug, commentId } = await ctx.params;
    const post = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    const result = await togglePublishedCommentLike({
      userId: uid,
      postId: post.id,
      commentId,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ liked: result.liked, likeCount: result.likeCount });
  });
}
