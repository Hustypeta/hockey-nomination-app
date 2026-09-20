import type { Prisma } from "@prisma/client";
import { previewCommentText } from "@/lib/community/display";
import type {
  CommunityAttachmentSnapshotV1,
  CommunityCommentDto,
  CommunityCommentPreviewDto,
  CommunityPostDto,
} from "@/lib/community/types";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";

export const communityAuthorSelect = {
  id: true,
  name: true,
  image: true,
  leaderboardNickname: true,
} as const;

export type CommunityAuthorRow = {
  id: string;
  name: string | null;
  image: string | null;
  leaderboardNickname: string | null;
};

export function serializeAuthor(author: CommunityAuthorRow, opts?: { isStaffPost?: boolean }) {
  const isStaff = !!opts?.isStaffPost;
  return {
    id: author.id,
    name: author.name,
    image: isStaff ? null : author.image,
    displayName: isStaff
      ? "Admin"
      : publicLeaderboardDisplayName({
          userId: author.id,
          nickname: author.leaderboardNickname,
        }),
    isStaff,
  };
}

const postInclude = {
  author: { select: communityAuthorSelect },
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

type CommentPreviewRow = {
  id: string;
  bodyMd: string;
  isStaffComment?: boolean;
  author: CommunityAuthorRow;
};

export function serializeCommentPreview(row: CommentPreviewRow): CommunityCommentPreviewDto | null {
  const text = previewCommentText(row.bodyMd);
  if (!text) return null;
  return {
    id: row.id,
    authorName: serializeAuthor(row.author, { isStaffPost: row.isStaffComment }).displayName,
    text,
  };
}

export function serializeCommentPreviews(rows: CommentPreviewRow[] | undefined): CommunityCommentPreviewDto[] {
  if (!rows?.length) return [];
  return [...rows]
    .reverse()
    .map(serializeCommentPreview)
    .filter((row): row is CommunityCommentPreviewDto => row !== null)
    .slice(-2);
}

export function serializePost(
  row: CommunityPostRow,
  likedByMe: boolean,
  previewComments: CommunityCommentPreviewDto[] = [],
): CommunityPostDto {
  const isStaffPost = row.isStaffPost;
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
    isStaffPost,
    author: serializeAuthor(row.author, { isStaffPost }),
    tags: row.tags.map((t) => ({ slug: t.tag.slug, label: t.tag.label })),
    attachments: row.attachments.map((a) => ({
      id: a.id,
      kind: a.kind,
      sortOrder: a.sortOrder,
      nominationId: a.nominationId,
      snapshot: parseSnapshot(a.snapshot),
    })),
    likedByMe,
    ...(previewComments.length ? { previewComments } : {}),
  };
}

export function serializeComment(
  row: {
    id: string;
    parentId: string | null;
    bodyMd: string;
    isStaffComment?: boolean;
    likeCount: number;
    createdAt: Date;
    author: CommunityAuthorRow;
  },
  likedByMe = false,
): CommunityCommentDto {
  return {
    id: row.id,
    parentId: row.parentId,
    bodyMd: row.bodyMd,
    likeCount: row.likeCount,
    likedByMe,
    createdAt: row.createdAt.toISOString(),
    author: serializeAuthor(row.author, { isStaffPost: row.isStaffComment }),
  };
}

export { postInclude };
