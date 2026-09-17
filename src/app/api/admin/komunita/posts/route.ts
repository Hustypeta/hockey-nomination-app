import { NextRequest, NextResponse } from "next/server";
import type { CommunityPostCategory, Prisma } from "@prisma/client";
import { allocateCommunityPostSlug } from "@/lib/allocateNominationSlug";
import { withAdminJson } from "@/lib/community/adminRoute";
import { ensureCommunityAdminUserId } from "@/lib/community/adminIdentity";
import {
  parseAttachmentInputs,
  resolveAttachmentsForAdmin,
  type AttachmentInput,
} from "@/lib/community/attachments";
import type { CommunitySortMode } from "@/lib/community/categories";
import {
  contestWinnerPostDraft,
  fetchContestWinnerForAdmin,
} from "@/lib/community/contestWinnerPost";
import {
  buildFantasyWinnerImageSnapshot,
  fantasyWinnerPostDraft,
  fetchFantasyWinnerForAdmin,
} from "@/lib/community/fantasyWinnerPost";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { ensureWelcomeForumPostPinned, sortPostsWithWelcomeFirst } from "@/lib/community/welcomeForumPost";
import { resolveCommunityTagIds } from "@/lib/community/tags";
import { validatePostBody, FORUM_POST_BODY_MAX, FORUM_POST_TITLE_MAX } from "@/lib/community/validate";
import { prisma } from "@/lib/prisma";

function parseSort(raw: string | null): CommunitySortMode {
  if (raw === "top") return "top";
  return "new";
}

function parseBool(raw: unknown, defaultValue: boolean): boolean {
  if (typeof raw === "boolean") return raw;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return defaultValue;
}

export async function GET(req: NextRequest) {
  return withAdminJson(async ({ userId }) => {
    const contestPreview = req.nextUrl.searchParams.get("contestWinnerPreview");
    if (contestPreview === "1" || contestPreview === "true") {
      const data = await fetchContestWinnerForAdmin();
      return NextResponse.json({
        ...data,
        draft: data.winner ? contestWinnerPostDraft(data.winner) : null,
      });
    }

    const fantasyPreview = req.nextUrl.searchParams.get("fantasyWinnerPreview");
    if (fantasyPreview === "1" || fantasyPreview === "true") {
      const data = await fetchFantasyWinnerForAdmin();
      return NextResponse.json({
        ...data,
        draft: data.winner && data.stats ? fantasyWinnerPostDraft(data.winner, data.stats) : null,
      });
    }

    const { searchParams } = req.nextUrl;
    const sort = parseSort(searchParams.get("sort"));
    const category = searchParams.get("category") as CommunityPostCategory | null;
    const q = searchParams.get("q")?.trim();
    const take = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 30) || 30));

    await ensureWelcomeForumPostPinned(prisma);

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
      posts: sortPostsWithWelcomeFirst(rows.map((r) => serializePost(r, likedSet.has(r.id)))),
    });
  });
}

export async function POST(req: NextRequest) {
  return withAdminJson(async () => {
    try {
      const authorId = await ensureCommunityAdminUserId();
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

      const contestWinner = body.contestWinner === true || body.contestWinner === "true";
      const fantasyWinner = body.fantasyWinner === true || body.fantasyWinner === "true";
      const pin = parseBool(body.pin, contestWinner || fantasyWinner);
      const isStaffPost = parseBool(body.asStaff, true);

      if (contestWinner && fantasyWinner) {
        return NextResponse.json(
          { error: "Použij buď contestWinner, nebo fantasyWinner — ne obojí najednou." },
          { status: 400 }
        );
      }

      let title: string;
      let bodyMd: string;
      let category: CommunityPostCategory;
      let tags: string[];

      let attachmentInputs = parseAttachmentInputs(body.attachments);

      if (typeof body.nominationId === "string" && body.nominationId.trim()) {
        const nominationAttachment: AttachmentInput = {
          kind: "NOMINATION",
          nominationId: body.nominationId.trim(),
        };
        attachmentInputs = [
          nominationAttachment,
          ...attachmentInputs.filter((a) => a.kind !== "NOMINATION"),
        ].slice(0, 3);
      }

      if (contestWinner) {
        const { winner } = await fetchContestWinnerForAdmin();
        if (!winner) {
          return NextResponse.json(
            { error: "Žebříček nominací je prázdný nebo chybí oficiální soupiska." },
            { status: 400 }
          );
        }

        const draft = contestWinnerPostDraft(winner);
        title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : draft.title;
        bodyMd = typeof body.bodyMd === "string" && body.bodyMd.trim() ? body.bodyMd.trim() : draft.bodyMd;
        category = draft.category;
        tags = Array.isArray(body.tags)
          ? body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim())
          : [];

        if (title.length < 3 || title.length > FORUM_POST_TITLE_MAX) {
          return NextResponse.json(
            { error: `Nadpis musí mít 3–${FORUM_POST_TITLE_MAX} znaků.` },
            { status: 400 }
          );
        }
        if (bodyMd.length < 2 || bodyMd.length > FORUM_POST_BODY_MAX) {
          return NextResponse.json({ error: "Text příspěvku má neplatnou délku." }, { status: 400 });
        }

        attachmentInputs = [
          {
            kind: "NOMINATION",
            nominationId: winner.nominationId,
            ...(typeof body.forumFrameImageUrl === "string" && body.forumFrameImageUrl.trim()
              ? { forumFrameImageUrl: body.forumFrameImageUrl.trim() }
              : {}),
          } satisfies AttachmentInput,
        ];
      } else if (fantasyWinner) {
        const { winner, stats } = await fetchFantasyWinnerForAdmin();
        if (!winner || !stats) {
          return NextResponse.json(
            { error: "Fantasy žebříček je prázdný nebo ještě nebyl vyhodnocen." },
            { status: 400 }
          );
        }

        const draft = fantasyWinnerPostDraft(winner, stats);
        title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : draft.title;
        bodyMd = typeof body.bodyMd === "string" && body.bodyMd.trim() ? body.bodyMd.trim() : draft.bodyMd;
        category = draft.category;
        tags = Array.isArray(body.tags)
          ? body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim())
          : [];

        const imageUrl =
          typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : draft.imageUrl;

        if (title.length < 3 || title.length > FORUM_POST_TITLE_MAX) {
          return NextResponse.json(
            { error: `Nadpis musí mít 3–${FORUM_POST_TITLE_MAX} znaků.` },
            { status: 400 }
          );
        }
        if (bodyMd.length < 2 || bodyMd.length > FORUM_POST_BODY_MAX) {
          return NextResponse.json({ error: "Text příspěvku má neplatnou délku." }, { status: 400 });
        }

        attachmentInputs = [
          {
            kind: "INLINE_SNAPSHOT",
            snapshot: buildFantasyWinnerImageSnapshot(imageUrl, title),
          } satisfies AttachmentInput,
        ];
      } else {
        const parsed = validatePostBody(body);
        if (!parsed.ok) {
          return NextResponse.json({ error: parsed.error }, { status: 400 });
        }
        title = parsed.title;
        bodyMd = parsed.bodyMd;
        category = parsed.category;
        tags = parsed.tags;
      }

      const attachments = await resolveAttachmentsForAdmin(prisma, attachmentInputs);
      const slug = await allocateCommunityPostSlug(prisma, title, null);
      const tagIds = await resolveCommunityTagIds(prisma, tags);

      const post = await prisma.$transaction(async (tx) => {
        const created = await tx.communityPost.create({
          data: {
            slug,
            authorId,
            category,
            title,
            bodyMd,
            isStaffPost,
            pinnedAt: pin ? new Date() : null,
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
