import { NextResponse } from "next/server";
import {
  communityMembersActiveWindowMinutes,
  listCommunityMembers,
} from "@/lib/community/listCommunityMembers";
import { withForumJson } from "@/lib/community/forumRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  return withForumJson(async () => {
    const members = await listCommunityMembers();
    return NextResponse.json({
      members,
      activeWindowMinutes: communityMembersActiveWindowMinutes(),
    });
  });
}
