import { NextResponse } from "next/server";
import { withForumJson } from "@/lib/community/forumRoute";
import { communityAuthorSelect, serializeAuthor } from "@/lib/community/serialize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTIVE_WINDOW_MS = 30 * 60 * 1000;
const ADMIN_USER_ID = "community-system-admin";

export async function GET() {
  return withForumJson(async () => {
    const [postActivity, commentActivity] = await Promise.all([
      prisma.communityPost.groupBy({
        by: ["authorId"],
        where: { status: "PUBLISHED", deletedAt: null },
        _max: { createdAt: true },
      }),
      prisma.communityComment.groupBy({
        by: ["authorId"],
        where: {
          status: "PUBLISHED",
          post: { status: "PUBLISHED", deletedAt: null },
        },
        _max: { createdAt: true },
      }),
    ]);

    const activityByUser = new Map<string, Date>();
    for (const activity of [...postActivity, ...commentActivity]) {
      const at = activity._max.createdAt;
      const current = activityByUser.get(activity.authorId);
      if (at && (!current || at > current)) activityByUser.set(activity.authorId, at);
    }

    const recent = [...activityByUser.entries()]
      .sort((a, b) => b[1].getTime() - a[1].getTime())
      .slice(0, 16);
    const users = await prisma.user.findMany({
      where: { id: { in: recent.map(([userId]) => userId) } },
      select: communityAuthorSelect,
    });
    const userById = new Map(users.map((user) => [user.id, user]));
    const activeAfter = Date.now() - ACTIVE_WINDOW_MS;

    const members = recent.flatMap(([userId, lastActiveAt]) => {
      const user = userById.get(userId);
      if (!user) return [];
      const publicAuthor = serializeAuthor(user, { isStaffPost: userId === ADMIN_USER_ID });
      return [{
        id: publicAuthor.id,
        displayName: publicAuthor.displayName,
        image: publicAuthor.image,
        isStaff: publicAuthor.isStaff,
        lastActiveAt: lastActiveAt.toISOString(),
        active: lastActiveAt.getTime() >= activeAfter,
      }];
    });

    return NextResponse.json({
      members,
      activeWindowMinutes: ACTIVE_WINDOW_MS / 60_000,
    });
  });
}
