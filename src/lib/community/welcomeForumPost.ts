import type { PrismaClient } from "@prisma/client";

/** Stabilní slug uvítacího příspěvku (viz `slugifyNominationTitle`). */
export const WELCOME_FORUM_POST_SLUG = "vitejte-na-forum-lineup";

export const WELCOME_FORUM_POST_TITLE_PREFIX = "Vítejte na fórum";

export function isWelcomeForumPost(post: { slug: string; title: string }): boolean {
  const slug = post.slug.toLowerCase();
  if (slug === WELCOME_FORUM_POST_SLUG || slug.startsWith(`${WELCOME_FORUM_POST_SLUG}-`)) {
    return true;
  }
  return post.title.trim().toLowerCase().startsWith(WELCOME_FORUM_POST_TITLE_PREFIX.toLowerCase());
}

/** Idempotentně připne staff uvítací příspěvek (pokud v DB existuje). */
export async function ensureWelcomeForumPostPinned(prisma: PrismaClient): Promise<void> {
  const row = await prisma.communityPost.findFirst({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      OR: [
        { slug: WELCOME_FORUM_POST_SLUG },
        { slug: { startsWith: `${WELCOME_FORUM_POST_SLUG}-` } },
        { title: { startsWith: WELCOME_FORUM_POST_TITLE_PREFIX, mode: "insensitive" } },
      ],
    },
    select: { id: true, pinnedAt: true, isStaffPost: true },
    orderBy: { createdAt: "asc" },
  });

  if (!row) return;

  if (row.pinnedAt && row.isStaffPost) return;

  await prisma.communityPost.update({
    where: { id: row.id },
    data: {
      pinnedAt: row.pinnedAt ?? new Date(),
      isStaffPost: true,
    },
  });
}

/** Uvítací příspěvek vždy nad ostatními (i ostatní připnuté). */
export function sortPostsWithWelcomeFirst<T extends { slug: string; title: string }>(posts: T[]): T[] {
  const welcome: T[] = [];
  const rest: T[] = [];
  for (const post of posts) {
    (isWelcomeForumPost(post) ? welcome : rest).push(post);
  }
  return [...welcome, ...rest];
}
