import { NextResponse } from "next/server";
import { withForumJson } from "@/lib/community/forumRoute";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  return withForumJson(async () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [postsThisWeek, totalPosts] = await Promise.all([
      prisma.communityPost.count({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.communityPost.count({
        where: { status: "PUBLISHED", deletedAt: null },
      }),
    ]);

    return NextResponse.json({ postsThisWeek, totalPosts });
  });
}
