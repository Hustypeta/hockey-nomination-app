import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";
import {
  computeMsFantasyLeaderboard,
  msFantasyLeaderboardIsPublic,
} from "@/lib/msFantasyLeaderboard";

function noStoreJson(data: object, init?: { status?: number }) {
  const res = NextResponse.json(data, init);
  res.headers.set("Cache-Control", "private, no-store, must-revalidate");
  return res;
}

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

export async function GET() {
  try {
    const admin = await isAdmin();
    const isPublic = msFantasyLeaderboardIsPublic();

    const { updatedAt, leaderboard } = await computeMsFantasyLeaderboard();

    if (!updatedAt || leaderboard.length === 0) {
      return noStoreJson({
        published: false,
        hidden: false,
        updatedAt: null as string | null,
        leaderboard: [],
      });
    }

    if (!isPublic && !admin) {
      return noStoreJson({
        published: false,
        hidden: true,
        updatedAt: null,
        leaderboard: [],
      });
    }

    return noStoreJson({
      published: true,
      hidden: false,
      updatedAt,
      leaderboard,
    });
  } catch (e) {
    console.error("fantasy leaderboard:", e);
    return noStoreJson({ error: "Fantasy žebříček se nepovedl načíst." }, { status: 500 });
  }
}
