import type { CommunityPostCategory } from "@prisma/client";

export const COMMUNITY_CATEGORY_LABELS: Record<CommunityPostCategory, string> = {
  LINEUP_NOMINATION: "Sestava",
  CONTESTS: "Soutěže",
  GENERAL: "Obecné",
  FANTASY: "Fantasy",
  Q_AND_A: "Otázky a odpovědi",
};

/** Visible in compose + sidebar filters. Legacy FANTASY / Q_AND_A stay labeled for existing posts. */
export const COMMUNITY_CATEGORY_ORDER: CommunityPostCategory[] = [
  "LINEUP_NOMINATION",
  "CONTESTS",
  "GENERAL",
];

export type CommunitySortMode = "new" | "top";

export const COMMUNITY_SORT_LABELS: Record<CommunitySortMode, string> = {
  new: "Nejnovější",
  top: "Nejoblíbenější",
};
