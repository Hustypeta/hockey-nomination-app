import { NextRequest, NextResponse } from "next/server";
import { withAdminJson, requireUserId } from "@/lib/community/adminRoute";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  return withAdminJson(async ({ userId }) => {
    const { slug } = await ctx.params;
    const row = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      include: postInclude,
    });
    if (!row) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }
    const liked = userId
      ? !!(await prisma.communityPostLike.findUnique({
          where: { userId_postId: { userId, postId: row.id } },
        }))
      : false;
    return NextResponse.json({ post: serializePost(row, liked) });
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  return withAdminJson(async ({ userId }) => {
    const uid = requireUserId(userId);
    const { slug } = await ctx.params;
    const row = await prisma.communityPost.findFirst({ where: { slug } });
    if (!row) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }
    if (row.authorId !== uid) {
      return NextResponse.json({ error: "Smazat může jen autor." }, { status: 403 });
    }
    await prisma.communityPost.update({
      where: { id: row.id },
      data: { status: "DELETED", deletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  });
}
