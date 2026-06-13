import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";
import { computePickemLeaderboard, pickemLeaderboardIsPublic } from "@/lib/pickemLeaderboard";

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
    const isPublic = pickemLeaderboardIsPublic();
    const { officialUpdatedAt, leaderboard } = await computePickemLeaderboard();

    if (!officialUpdatedAt) {
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
      updatedAt: officialUpdatedAt,
      leaderboard: leaderboard.map((row) => ({
        rank: row.rank,
        userId: row.userId,
        displayName: row.displayName,
        points: row.points,
      })),
    });
  } catch (e) {
    console.error("pickem leaderboard:", e);
    return noStoreJson({ error: "Pick'em žebříček se nepovedl načíst." }, { status: 500 });
  }
}
