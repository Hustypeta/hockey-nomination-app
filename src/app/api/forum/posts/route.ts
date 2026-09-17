import { NextRequest, NextResponse } from "next/server";
import type { CommunityPostCategory } from "@prisma/client";
import { allocateCommunityPostSlug } from "@/lib/allocateNominationSlug";
import { parseCommunitySort, parseForumWindow, listPublishedPosts } from "@/lib/community/listPublishedPosts";
import { withForumJson, requireForumUser } from "@/lib/community/forumRoute";
import { parseAttachmentInputs, resolveAttachmentsForUser } from "@/lib/community/attachments";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { resolveCommunityTagIds } from "@/lib/community/tags";
import { validatePostBody } from "@/lib/community/validate";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return withForumJson(async ({ userId }) => {
    const { searchParams } = req.nextUrl;
    const sort = parseCommunitySort(searchParams.get("sort"));
    const window = parseForumWindow(searchParams.get("window"));
    const category = searchParams.get("category") as CommunityPostCategory | null;
    const q = searchParams.get("q")?.trim();
    const take = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 30) || 30));

    try {
      const posts = await listPublishedPosts({
        sort,
        category: category || null,
        q,
        take,
        userId,
        window,
      });
      return NextResponse.json({ posts });
    } catch (error) {
      console.error("GET /api/forum/posts:", error);
      return NextResponse.json({ posts: [] }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withForumJson(async ({ userId }) => {
    try {
      const authorId = requireForumUser(userId);
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const parsed = validatePostBody(body);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }

      const attachmentInputs = parseAttachmentInputs(body.attachments);
      const attachments = await resolveAttachmentsForUser(prisma, authorId, attachmentInputs);
      const slug = await allocateCommunityPostSlug(prisma, parsed.title, null);
      const tagIds = await resolveCommunityTagIds(prisma, parsed.tags);

      const post = await prisma.$transaction(async (tx) => {
        const created = await tx.communityPost.create({
          data: {
            slug,
            authorId,
            category: parsed.category,
            title: parsed.title,
            bodyMd: parsed.bodyMd,
            attachments: {
              create: attachments.map((a) => ({
                kind: a.kind,
                nominationId: a.nominationId,
                snapshot: a.snapshot as unknown as Prisma.InputJsonValue,
                sortOrder: a.sortOrder,
              })),
            },
          },
          include: postInclude,
        });
        if (tagIds.length) {
          await tx.communityPostTag.createMany({
            data: tagIds.map((tagId) => ({ postId: created.id, tagId })),
          });
          await tx.communityTag.updateMany({
            where: { id: { in: tagIds } },
            data: { useCount: { increment: 1 } },
          });
        }
        return created;
      });

      return NextResponse.json({ post: serializePost(post, false) }, { status: 201 });
    } catch (e: unknown) {
      const status =
        e && typeof e === "object" && "status" in e && typeof (e as { status: number }).status === "number"
          ? (e as { status: number }).status
          : 500;
      if (status === 401) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Neautorizováno." }, { status: 401 });
      }
      console.error("POST /api/forum/posts:", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Interní chyba při ukládání příspěvku." },
        { status: 500 }
      );
    }
  });
}
