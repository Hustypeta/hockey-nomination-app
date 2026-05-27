import { NextRequest, NextResponse } from "next/server";
import type { CommunityPostCategory, Prisma } from "@prisma/client";
import { allocateCommunityPostSlug } from "@/lib/allocateNominationSlug";
import { withAdminJson, requireUserId } from "@/lib/community/adminRoute";
import { parseAttachmentInputs, resolveAttachmentsForUser } from "@/lib/community/attachments";
import type { CommunitySortMode } from "@/lib/community/categories";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { resolveCommunityTagIds, syncPostTags } from "@/lib/community/tags";
import { validatePostBody } from "@/lib/community/validate";
import { prisma } from "@/lib/prisma";

function parseSort(raw: string | null): CommunitySortMode {
  if (raw === "top" || raw === "discussed") return raw;
  return "new";
}

export async function GET(req: NextRequest) {
  return withAdminJson(async ({ userId }) => {
    const { searchParams } = req.nextUrl;
    const sort = parseSort(searchParams.get("sort"));
    const category = searchParams.get("category") as CommunityPostCategory | null;
    const q = searchParams.get("q")?.trim();
    const take = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 30) || 30));

    const where: Prisma.CommunityPostWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { bodyMd: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.CommunityPostOrderByWithRelationInput[] =
      sort === "top"
        ? [{ pinnedAt: "desc" }, { score: "desc" }, { createdAt: "desc" }]
        : sort === "discussed"
          ? [{ pinnedAt: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }]
          : [{ pinnedAt: "desc" }, { createdAt: "desc" }];

    const rows = await prisma.communityPost.findMany({
      where,
      orderBy,
      take,
      include: postInclude,
    });

    const liked = userId
      ? await prisma.communityPostLike.findMany({
          where: { userId, postId: { in: rows.map((r) => r.id) } },
          select: { postId: true },
        })
      : [];
    const likedSet = new Set(liked.map((l) => l.postId));

    return NextResponse.json({
      posts: rows.map((r) => serializePost(r, likedSet.has(r.id))),
    });
  });
}

export async function POST(req: NextRequest) {
  return withAdminJson(async ({ userId }) => {
    try {
      const authorId = requireUserId(userId);
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
      console.error("POST /api/admin/komunita/posts failed:", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Interní chyba při ukládání příspěvku." },
        { status: 500 }
      );
    }
  });
}
