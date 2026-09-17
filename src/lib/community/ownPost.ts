/** Technický autor příspěvků z admin panelu (systémová identita Admin). */
export const COMMUNITY_ADMIN_USER_ID = "community-system-admin";

/** Vlastní = Admin identita, nebo příspěvek přihlášeného admin účtu. Cizí ne. */
export function isOwnAdminForumPost(
  authorId: string,
  sessionUserId?: string | null,
): boolean {
  if (authorId === COMMUNITY_ADMIN_USER_ID) return true;
  return !!sessionUserId && authorId === sessionUserId;
}

/** Admin panel: staff/Admin příspěvky + vlastní účet. Ne cizí členy. */
export function canEditAdminForumPost(
  post: { isStaffPost?: boolean; author: { id: string; isStaff?: boolean } },
  sessionUserId?: string | null,
): boolean {
  if (post.isStaffPost || post.author.isStaff) return true;
  return isOwnAdminForumPost(post.author.id, sessionUserId);
}
