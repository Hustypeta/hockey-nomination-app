import { NextRequest, NextResponse } from "next/server";
import { withAdminJson } from "@/lib/community/adminRoute";
import { ensureCommunityAdminUserId } from "@/lib/community/adminIdentity";
import { listPublishedCommentsForPost } from "@/lib/community/commentLikes";
import { serializeComment, communityAuthorSelect } from "@/lib/community/serialize";
import { validateCommentBody } from "@/lib/community/validate";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  return withAdminJson(async () => {
    const { slug } = await ctx.params;
    const post = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }
    const likeUserId = await ensureCommunityAdminUserId();
    const comments = await listPublishedCommentsForPost(post.id, likeUserId);
    return NextResponse.json({ comments });
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return withAdminJson(async () => {
    const authorId = await ensureCommunityAdminUserId();
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = validateCommentBody(body.bodyMd);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const parentId = typeof body.parentId === "string" ? body.parentId : null;

    const post = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    if (parentId) {
      const parent = await prisma.communityComment.findFirst({
        where: { id: parentId, postId: post.id, status: "PUBLISHED" },
        select: { parentId: true },
      });
      if (!parent) {
        return NextResponse.json({ error: "Nadřazený komentář nenalezen." }, { status: 400 });
      }
      if (parent.parentId) {
        return NextResponse.json(
          { error: "Odpovědi lze přidávat jen k hlavním komentářům." },
          { status: 400 },
        );
      }
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.communityComment.create({
        data: {
          postId: post.id,
          authorId,
          parentId,
          bodyMd: parsed.bodyMd,
          isStaffComment: true,
        },
        include: { author: { select: communityAuthorSelect } },
      });
      await tx.communityPost.update({
        where: { id: post.id },
        data: { commentCount: { increment: 1 }, score: { increment: 1 } },
      });
      return created;
    });

    return NextResponse.json({ comment: serializeComment(comment) }, { status: 201 });
  });
}
