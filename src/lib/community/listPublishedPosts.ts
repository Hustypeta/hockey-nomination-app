import type { CommunityPostCategory, Prisma } from "@prisma/client";
import type { CommunitySortMode } from "@/lib/community/categories";
import { communityAuthorSelect, postInclude, serializeCommentPreviews, serializePost } from "@/lib/community/serialize";
import { ensureWelcomeForumPostPinned, sortPostsWithWelcomeFirst } from "@/lib/community/welcomeForumPost";
import { prisma } from "@/lib/prisma";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKLY_RANK_POOL = 80;

export type ForumListWindow = "week";

/** Weekly popular: likes and comments count equally; ties go to the newer post. */
export function weeklyPopularScore(likeCount: number, commentCount: number): number {
  return likeCount + commentCount;
}

export function parseCommunitySort(raw: string | null): CommunitySortMode {
  if (raw === "top") return "top";
  return "new";
}

export function parseForumWindow(raw: string | null): ForumListWindow | null {
  return raw === "week" ? "week" : null;
}

export async function listPublishedPosts(opts: {
  sort: CommunitySortMode;
  category?: CommunityPostCategory | null;
  q?: string;
  take: number;
  userId: string | null;
  window?: ForumListWindow | null;
}) {
  await ensureWelcomeForumPostPinned(prisma);

  const since = opts.window === "week" ? new Date(Date.now() - WEEK_MS) : null;
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
    ...(since ? { createdAt: { gte: since } } : {}),
  };

  const weeklyRank = opts.window === "week";
  const orderBy: Prisma.CommunityPostOrderByWithRelationInput[] = weeklyRank
    ? [{ likeCount: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }]
    : opts.sort === "top"
      ? [{ pinnedAt: "desc" }, { score: "desc" }, { createdAt: "desc" }]
      : [{ pinnedAt: "desc" }, { createdAt: "desc" }];

  const rows = await prisma.communityPost.findMany({
    where,
    orderBy,
    take: weeklyRank ? Math.max(opts.take, WEEKLY_RANK_POOL) : opts.take,
    include: {
      ...postInclude,
      comments: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          id: true,
          bodyMd: true,
          isStaffComment: true,
          author: { select: communityAuthorSelect },
        },
      },
    },
  });

  const ranked = weeklyRank
    ? [...rows]
        .sort((a, b) => {
          const scoreDiff =
            weeklyPopularScore(b.likeCount, b.commentCount) -
            weeklyPopularScore(a.likeCount, a.commentCount);
          if (scoreDiff !== 0) return scoreDiff;
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, opts.take)
    : rows;

  const liked = opts.userId
    ? await prisma.communityPostLike.findMany({
        where: { userId: opts.userId, postId: { in: ranked.map((r) => r.id) } },
        select: { postId: true },
      })
    : [];
  const likedSet = new Set(liked.map((l) => l.postId));
  const posts = ranked.map((r) =>
    serializePost(r, likedSet.has(r.id), serializeCommentPreviews(r.comments)),
  );

  return weeklyRank ? posts : sortPostsWithWelcomeFirst(posts);
}
