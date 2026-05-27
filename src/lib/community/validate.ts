import type { CommunityPostCategory } from "@prisma/client";
import { COMMUNITY_CATEGORY_ORDER } from "@/lib/community/categories";

const CATEGORIES = new Set<string>(COMMUNITY_CATEGORY_ORDER);

export function parseCategory(raw: unknown): CommunityPostCategory | null {
  if (typeof raw !== "string") return null;
  return CATEGORIES.has(raw) ? (raw as CommunityPostCategory) : null;
}

export function validatePostBody(input: {
  title?: unknown;
  bodyMd?: unknown;
  category?: unknown;
  tags?: unknown;
}): { ok: true; title: string; bodyMd: string; category: CommunityPostCategory; tags: string[] } | { ok: false; error: string } {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const bodyMd = typeof input.bodyMd === "string" ? input.bodyMd.trim() : "";
  const category = parseCategory(input.category);
  if (!title || title.length < 3) return { ok: false, error: "Nadpis musí mít alespoň 3 znaky." };
  if (title.length > 120) return { ok: false, error: "Nadpis je příliš dlouhý." };
  if (!bodyMd || bodyMd.length < 2) return { ok: false, error: "Text příspěvku je prázdný." };
  if (bodyMd.length > 12000) return { ok: false, error: "Text je příliš dlouhý." };
  if (!category) return { ok: false, error: "Neplatná kategorie." };
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim())
    : [];
  return { ok: true, title, bodyMd, category, tags };
}

export function validateCommentBody(bodyMd: unknown): { ok: true; bodyMd: string } | { ok: false; error: string } {
  const text = typeof bodyMd === "string" ? bodyMd.trim() : "";
  if (!text || text.length < 1) return { ok: false, error: "Komentář je prázdný." };
  if (text.length > 4000) return { ok: false, error: "Komentář je příliš dlouhý." };
  return { ok: true, bodyMd: text };
}
