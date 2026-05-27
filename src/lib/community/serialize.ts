import type { Prisma } from "@prisma/client";
import type { CommunityAttachmentSnapshotV1, CommunityCommentDto, CommunityPostDto } from "@/lib/community/types";

const postInclude = {
  author: { select: { id: true, name: true, image: true } },
  tags: { include: { tag: { select: { slug: true, label: true } } } },
  attachments: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.CommunityPostInclude;

export type CommunityPostRow = Prisma.CommunityPostGetPayload<{ include: typeof postInclude }>;

export function parseSnapshot(json: unknown): CommunityAttachmentSnapshotV1 {
  if (typeof json === "object" && json !== null && "version" in json) {
    return json as CommunityAttachmentSnapshotV1;
  }
  return { version: 1, kind: "INLINE_SNAPSHOT" };
}

export function serializePost(row: CommunityPostRow, likedByMe: boolean): CommunityPostDto {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    bodyMd: row.bodyMd,
    pinnedAt: row.pinnedAt?.toISOString() ?? null,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    score: row.score,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    author: row.author,
    tags: row.tags.map((t) => ({ slug: t.tag.slug, label: t.tag.label })),
    attachments: row.attachments.map((a) => ({
      id: a.id,
      kind: a.kind,
      sortOrder: a.sortOrder,
      nominationId: a.nominationId,
      snapshot: parseSnapshot(a.snapshot),
    })),
    likedByMe,
  };
}

export function serializeComment(row: {
  id: string;
  parentId: string | null;
  bodyMd: string;
  likeCount: number;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null };
}): CommunityCommentDto {
  return {
    id: row.id,
    parentId: row.parentId,
    bodyMd: row.bodyMd,
    likeCount: row.likeCount,
    createdAt: row.createdAt.toISOString(),
    author: row.author,
  };
}

export { postInclude };
