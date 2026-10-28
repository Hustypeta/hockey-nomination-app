import { NextResponse } from "next/server";
import {
  countCommunityMembers,
  communityMembersActiveWindowMinutes,
  listCommunityMembers,
} from "@/lib/community/listCommunityMembers";
import { withForumJson } from "@/lib/community/forumRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  return withForumJson(async () => {
    const [members, totalCount] = await Promise.all([
      listCommunityMembers(),
      countCommunityMembers(),
    ]);
    return NextResponse.json({
      members,
      totalCount,
      activeWindowMinutes: communityMembersActiveWindowMinutes(),
    });
  });
}
