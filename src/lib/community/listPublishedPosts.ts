import type { CommunityPostCategory, Prisma } from "@prisma/client";
import type { CommunitySortMode } from "@/lib/community/categories";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { ensureWelcomeForumPostPinned, sortPostsWithWelcomeFirst } from "@/lib/community/welcomeForumPost";
import { prisma } from "@/lib/prisma";

export function parseCommunitySort(raw: string | null): CommunitySortMode {
  if (raw === "top" || raw === "discussed") return raw;
  return "new";
}

export async function listPublishedPosts(opts: {
  sort: CommunitySortMode;
  category?: CommunityPostCategory | null;
  q?: string;
  take: number;
  userId: string | null;
}) {
  await ensureWelcomeForumPostPinned(prisma);

  const where: Prisma.CommunityPostWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.q
      ? {
          OR: [
            { title: { contains: opts.q, mode: "insensitive" } },
            { bodyMd: { contains: opts.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.CommunityPostOrderByWithRelationInput[] =
    opts.sort === "top"
      ? [{ pinnedAt: "desc" }, { score: "desc" }, { createdAt: "desc" }]
      : opts.sort === "discussed"
        ? [{ pinnedAt: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }]
        : [{ pinnedAt: "desc" }, { createdAt: "desc" }];

  const rows = await prisma.communityPost.findMany({
    where,
    orderBy,
    take: opts.take,
    include: postInclude,
  });

  const liked = opts.userId
    ? await prisma.communityPostLike.findMany({
        where: { userId: opts.userId, postId: { in: rows.map((r) => r.id) } },
        select: { postId: true },
      })
    : [];
  const likedSet = new Set(liked.map((l) => l.postId));

  return sortPostsWithWelcomeFirst(rows.map((r) => serializePost(r, likedSet.has(r.id))));
}
