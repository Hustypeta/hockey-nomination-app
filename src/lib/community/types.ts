import type { CommunityAttachmentKind, CommunityPostCategory } from "@prisma/client";
import type { LineupStructure } from "@/types";

export type CommunityAttachmentSnapshotV1 = {
  version: 1;
  kind: CommunityAttachmentKind;
  title?: string | null;
  captainId?: string | null;
  lineupStructure?: LineupStructure;
  sourcePath?: string;
  meta?: Record<string, string | number | boolean | null>;
  createdAt?: string;
};

export type CommunityPostDto = {
  id: string;
  slug: string;
  category: CommunityPostCategory;
  title: string;
  bodyMd: string;
  pinnedAt: string | null;
  likeCount: number;
  commentCount: number;
  score: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  tags: { slug: string; label: string }[];
  attachments: {
    id: string;
    kind: CommunityAttachmentKind;
    sortOrder: number;
    nominationId: string | null;
    snapshot: CommunityAttachmentSnapshotV1;
  }[];
  likedByMe: boolean;
};

export type CommunityCommentDto = {
  id: string;
  parentId: string | null;
  bodyMd: string;
  likeCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type MyLineupPick = {
  kind: "NOMINATION" | "MATCH_LINEUP" | "FANTASY_LINEUP";
  id: string;
  title: string;
  createdAt: string;
  slug?: string | null;
  meta?: string;
};
