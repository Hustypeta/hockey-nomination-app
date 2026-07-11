import type { CommunityAttachmentSnapshotV1 } from "@/lib/community/types";

/** Veřejná cesta k PNG rámu fóra — jen tyto URL se propíší do snapshot.meta.imageUrl. */
export const FORUM_POSTER_PUBLIC_PREFIX = "/images/forum/posts/";

export function isValidForumPosterPublicUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith(FORUM_POSTER_PUBLIC_PREFIX)) return false;
  if (trimmed.includes("..") || trimmed.includes("\\")) return false;
  return /^\/images\/forum\/posts\/[a-f0-9-]+\.png$/.test(trimmed);
}

export function withForumFrameImageMeta(
  snapshot: CommunityAttachmentSnapshotV1,
  imageUrl: string | undefined,
  imageAlt?: string | null
): CommunityAttachmentSnapshotV1 {
  if (!imageUrl || !isValidForumPosterPublicUrl(imageUrl)) return snapshot;
  return {
    ...snapshot,
    meta: {
      ...snapshot.meta,
      imageUrl: imageUrl.trim(),
      imageAlt: imageAlt?.trim() || snapshot.title || "Sestava",
    },
  };
}
