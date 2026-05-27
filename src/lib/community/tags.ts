import type { PrismaClient } from "@prisma/client";
import { slugifyNominationTitle } from "@/lib/allocateNominationSlug";

function normalizeTagLabel(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  return t.slice(0, 40);
}

/** Vytvoří nebo najde tagy a vrátí jejich id (max 5). */
export async function resolveCommunityTagIds(
  prisma: PrismaClient,
  labels: string[]
): Promise<string[]> {
  const unique = [...new Set(labels.map(normalizeTagLabel).filter((l) => l.length >= 2))].slice(
    0,
    5
  );
  const ids: string[] = [];
  for (const label of unique) {
    const slug = slugifyNominationTitle(label) || `tag-${label.slice(0, 8)}`;
    const row = await prisma.communityTag.upsert({
      where: { slug },
      create: { slug, label },
      update: { label },
      select: { id: true },
    });
    ids.push(row.id);
  }
  return ids;
}

export async function syncPostTags(
  prisma: PrismaClient,
  postId: string,
  tagIds: string[]
): Promise<void> {
  const existing = await prisma.communityPostTag.findMany({
    where: { postId },
    select: { tagId: true },
  });
  const prev = new Set(existing.map((e) => e.tagId));
  const next = new Set(tagIds);
  const toRemove = [...prev].filter((id) => !next.has(id));
  const toAdd = [...next].filter((id) => !prev.has(id));

  if (toRemove.length) {
    await prisma.communityPostTag.deleteMany({
      where: { postId, tagId: { in: toRemove } },
    });
    await prisma.communityTag.updateMany({
      where: { id: { in: toRemove } },
      data: { useCount: { decrement: 1 } },
    });
  }
  if (toAdd.length) {
    await prisma.communityPostTag.createMany({
      data: toAdd.map((tagId) => ({ postId, tagId })),
      skipDuplicates: true,
    });
    await prisma.communityTag.updateMany({
      where: { id: { in: toAdd } },
      data: { useCount: { increment: 1 } },
    });
  }
}
