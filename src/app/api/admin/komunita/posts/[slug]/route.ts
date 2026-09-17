import { NextRequest, NextResponse } from "next/server";
import { withAdminJson } from "@/lib/community/adminRoute";
import { isOwnAdminForumPost } from "@/lib/community/ownPost";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { validatePostText } from "@/lib/community/validate";
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return withAdminJson(async ({ userId }) => {
    const { slug } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const row = await prisma.communityPost.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null },
    });
    if (!row) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }

    if (!row.isStaffPost && !isOwnAdminForumPost(row.authorId, userId)) {
      return NextResponse.json(
        { error: "Upravit lze jen vlastní příspěvky, ne příspěvky ostatních." },
        { status: 403 },
      );
    }

    const parsed = validatePostText(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const updated = await prisma.communityPost.update({
      where: { id: row.id },
      data: { title: parsed.title, bodyMd: parsed.bodyMd },
      include: postInclude,
    });

    const liked = userId
      ? !!(await prisma.communityPostLike.findUnique({
          where: { userId_postId: { userId, postId: updated.id } },
        }))
      : false;

    return NextResponse.json({ post: serializePost(updated, liked) });
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  return withAdminJson(async () => {
    const { slug } = await ctx.params;
    const row = await prisma.communityPost.findFirst({ where: { slug } });
    if (!row) {
      return NextResponse.json({ error: "Příspěvek nenalezen." }, { status: 404 });
    }
    await prisma.communityPost.update({
      where: { id: row.id },
      data: { status: "DELETED", deletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  });
}
