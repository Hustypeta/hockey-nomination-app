import type { CommunityPostCategory } from "@prisma/client";
import { COMMUNITY_CATEGORY_ORDER } from "@/lib/community/categories";

/** Krátký nadpis — vejde se do 4:5 náhledu bez scrollu. */
export const FORUM_POST_TITLE_MAX = 80;
/**
 * 520 znaků + 14 řádků se na 4:5 kartě vejde s 15–16px / 1.42–1.45 textem
 * i s až čtyřřádkovým nadpisem (80 znaků). FittedForumText nesmí klesnout pod 13px.
 * Desktop (~448×560) nechává rezervu nad patičkou; mobil (~360×450) je těsnější strop.
 */
export const FORUM_POST_BODY_MAX = 520;
/** Brání patologickému vstupu s jedním znakem na řádek, který samotný limit znaků neřeší. */
export const FORUM_POST_BODY_MAX_LINES = 14;

const CATEGORIES = new Set<string>(COMMUNITY_CATEGORY_ORDER);

export function parseCategory(raw: unknown): CommunityPostCategory | null {
  if (typeof raw !== "string") return null;
  return CATEGORIES.has(raw) ? (raw as CommunityPostCategory) : null;
}

export function validatePostText(input: {
  title?: unknown;
  bodyMd?: unknown;
}): { ok: true; title: string; bodyMd: string } | { ok: false; error: string } {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const bodyMd = typeof input.bodyMd === "string" ? input.bodyMd.trim() : "";
  if (!title || title.length < 3) return { ok: false, error: "Nadpis musí mít alespoň 3 znaky." };
  if (title.length > FORUM_POST_TITLE_MAX) {
    return { ok: false, error: `Nadpis může mít nejvýše ${FORUM_POST_TITLE_MAX} znaků.` };
  }
  if (!bodyMd || bodyMd.length < 2) return { ok: false, error: "Text příspěvku je prázdný." };
  if (bodyMd.length > FORUM_POST_BODY_MAX) {
    return { ok: false, error: `Text může mít nejvýše ${FORUM_POST_BODY_MAX} znaků.` };
  }
  const lineCount = bodyMd.split(/\r\n?|\n/).length;
  if (lineCount > FORUM_POST_BODY_MAX_LINES) {
    return {
      ok: false,
      error: `Text může mít nejvýše ${FORUM_POST_BODY_MAX_LINES} řádků.`,
    };
  }
  return { ok: true, title, bodyMd };
}

export function validatePostBody(input: {
  title?: unknown;
  bodyMd?: unknown;
  category?: unknown;
  tags?: unknown;
}): { ok: true; title: string; bodyMd: string; category: CommunityPostCategory; tags: string[] } | { ok: false; error: string } {
  const text = validatePostText(input);
  if (!text.ok) return text;
  const category = parseCategory(input.category);
  if (!category) return { ok: false, error: "Neplatná kategorie." };
  const tags = Array.isArray(input.tags)
    ? input.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim())
    : [];
  return { ok: true, title: text.title, bodyMd: text.bodyMd, category, tags };
}

export function validateCommentBody(bodyMd: unknown): { ok: true; bodyMd: string } | { ok: false; error: string } {
  const text = typeof bodyMd === "string" ? bodyMd.trim() : "";
  if (!text || text.length < 1) return { ok: false, error: "Komentář je prázdný." };
  if (text.length > 4000) return { ok: false, error: "Komentář je příliš dlouhý." };
  return { ok: true, bodyMd: text };
}
