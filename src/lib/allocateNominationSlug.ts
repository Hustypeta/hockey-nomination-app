import type { PrismaClient } from "@prisma/client";

const DIACRITICS: [string, string][] = [
  ["á", "a"],
  ["č", "c"],
  ["ď", "d"],
  ["é", "e"],
  ["ě", "e"],
  ["í", "i"],
  ["ň", "n"],
  ["ó", "o"],
  ["ř", "r"],
  ["š", "s"],
  ["ť", "t"],
  ["ú", "u"],
  ["ů", "u"],
  ["ý", "y"],
  ["ž", "z"],
  ["Á", "a"],
  ["Č", "c"],
  ["Ř", "r"],
  ["Š", "s"],
  ["Ž", "z"],
];

/** Veřejná část URL (/v/…) — jen [a-z0-9-]. */
export function slugifyNominationTitle(raw: string): string {
  let s = raw.trim().toLowerCase();
  for (const [from, to] of DIACRITICS) {
    s = s.split(from).join(to);
  }
  s = s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return s;
}

function randomSlugSuffix(len = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i]! % chars.length];
  return out;
}

export async function allocateNominationSlug(
  prisma: PrismaClient,
  title: string | null,
  excludeNominationId: string | null
): Promise<string> {
  let base = title ? slugifyNominationTitle(title) : "";
  if (!base || base.length < 2) {
    base = `nom-${randomSlugSuffix(8)}`;
  }

  let candidate = base;
  let n = 0;
  for (;;) {
    const clash = await prisma.nomination.findFirst({
      where: {
        slug: candidate,
        ...(excludeNominationId ? { NOT: { id: excludeNominationId } } : {}),
      },
      select: { id: true },
    });
    if (!clash) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
    if (n > 200) {
      return `${base}-${randomSlugSuffix(6)}`;
    }
  }
}
