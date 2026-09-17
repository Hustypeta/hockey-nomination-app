import { COMMUNITY_ADMIN_USER_ID } from "@/lib/community/ownPost";
import { prisma } from "@/lib/prisma";

export { COMMUNITY_ADMIN_USER_ID };

/**
 * Technický autor obsahu vytvořeného z admin panelu.
 * Není svázaný s hráčským Google účtem správce.
 */
export async function ensureCommunityAdminUserId(): Promise<string> {
  const admin = await prisma.user.upsert({
    where: { id: COMMUNITY_ADMIN_USER_ID },
    update: { name: "Admin", leaderboardNickname: "Admin" },
    create: {
      id: COMMUNITY_ADMIN_USER_ID,
      name: "Admin",
      leaderboardNickname: "Admin",
    },
    select: { id: true },
  });

  return admin.id;
}
