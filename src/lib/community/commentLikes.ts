import { communityAuthorSelect, serializeComment } from "@/lib/community/serialize";
import type { CommunityCommentDto } from "@/lib/community/types";
import { prisma } from "@/lib/prisma";

export async function likedCommentIdSet(userId: string | null, commentIds: string[]): Promise<Set<string>> {
  if (!userId || commentIds.length === 0) return new Set();
  const liked = await prisma.communityCommentLike.findMany({
    where: { userId, commentId: { in: commentIds } },
    select: { commentId: true },
  });
  return new Set(liked.map((row) => row.commentId));
}

export async function listPublishedCommentsForPost(
  postId: string,
  userId: string | null,
): Promise<CommunityCommentDto[]> {
  const rows = await prisma.communityComment.findMany({
    where: { postId, status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: communityAuthorSelect } },
  });
  const likedSet = await likedCommentIdSet(
    userId,
    rows.map((row) => row.id),
  );
  return rows.map((row) => serializeComment(row, likedSet.has(row.id)));
}

export async function togglePublishedCommentLike(opts: {
  userId: string;
  postId: string;
  commentId: string;
}): Promise<{ ok: true; liked: boolean; likeCount: number } | { ok: false; status: number; error: string }> {
  const comment = await prisma.communityComment.findFirst({
    where: { id: opts.commentId, postId: opts.postId, status: "PUBLISHED" },
    select: { id: true, likeCount: true },
  });
  if (!comment) {
    return { ok: false, status: 404, error: "Komentář nenalezen." };
  }

  const existing = await prisma.communityCommentLike.findUnique({
    where: { userId_commentId: { userId: opts.userId, commentId: comment.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.communityCommentLike.delete({
        where: { userId_commentId: { userId: opts.userId, commentId: comment.id } },
      }),
      prisma.communityComment.update({
        where: { id: comment.id },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { ok: true, liked: false, likeCount: Math.max(0, comment.likeCount - 1) };
  }

  await prisma.$transaction([
    prisma.communityCommentLike.create({
      data: { userId: opts.userId, commentId: comment.id },
    }),
    prisma.communityComment.update({
      where: { id: comment.id },
      data: { likeCount: { increment: 1 } },
    }),
  ]);
  return { ok: true, liked: true, likeCount: comment.likeCount + 1 };
}
