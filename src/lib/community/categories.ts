import type { CommunityPostCategory } from "@prisma/client";

export const COMMUNITY_CATEGORY_LABELS: Record<CommunityPostCategory, string> = {
  LINEUP_NOMINATION: "Soupiska / nominace",
  FANTASY: "Fantasy",
  GENERAL: "Obecné",
  Q_AND_A: "Otázky a odpovědi",
  MEMES: "Memes",
  OFF_TOPIC: "Off-topic",
};

export const COMMUNITY_CATEGORY_ORDER: CommunityPostCategory[] = [
  "LINEUP_NOMINATION",
  "FANTASY",
  "GENERAL",
  "Q_AND_A",
  "MEMES",
  "OFF_TOPIC",
];

export type CommunitySortMode = "new" | "top" | "discussed";

export const COMMUNITY_SORT_LABELS: Record<CommunitySortMode, string> = {
  new: "Nejnovější",
  top: "Nejlajkovanější",
  discussed: "Nejvíce komentované",
};
