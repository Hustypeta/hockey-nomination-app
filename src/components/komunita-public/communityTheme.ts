import type { CommunityPostCategory } from "@prisma/client";

export const COMMUNITY_BG = "#05070f";
export const ICE = "#00b4ff";
export const ACTION = "#ff2d55";

export type PublicCommunityCategory =
  | "EXTRALIGA"
  | "REPRE"
  | "MEMES"
  | "ANALYZY"
  | "DISKUZE"
  | "SESTAVY";

export const PUBLIC_CATEGORY_LABELS: Record<PublicCommunityCategory, string> = {
  EXTRALIGA: "Extraliga",
  REPRE: "Repre / MS",
  MEMES: "Memes & Humor",
  ANALYZY: "Analýzy & Taktika",
  DISKUZE: "Volná diskuse",
  SESTAVY: "Sestavy & Grafiky",
};

export const PUBLIC_CATEGORY_EMOJI: Record<PublicCommunityCategory, string> = {
  EXTRALIGA: "🏒",
  REPRE: "🇨🇿",
  MEMES: "🔥",
  ANALYZY: "📊",
  DISKUZE: "💬",
  SESTAVY: "🖼️",
};

// Map public “pill” categories to DB categories (simple MVP mapping).
export function mapPublicToDbCategory(
  cat: PublicCommunityCategory | ""
): CommunityPostCategory | "" {
  if (!cat) return "";
  if (cat === "MEMES") return "MEMES";
  if (cat === "DISKUZE") return "GENERAL";
  if (cat === "ANALYZY") return "Q_AND_A";
  if (cat === "SESTAVY") return "LINEUP_NOMINATION";
  // EXTRALIGA / REPRE are not first-class in DB yet; fall back to GENERAL.
  return "GENERAL";
}

