import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeContestLeaderboard, contestLeaderboardIsPublic } from "@/lib/contestLeaderboard";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }

    const published = contestLeaderboardIsPublic();
    if (!published) {
      return NextResponse.json({
        published: false,
        participant: false,
        rank: null,
        points: null,
        maxPoints: null,
        totalParticipants: 0,
      });
    }

    const { leaderboard, maxAchievablePoints } = await computeContestLeaderboard();
    const mine = leaderboard.find((r) => r.userId === userId);
    if (!mine) {
      return NextResponse.json({
        published: true,
        participant: false,
        rank: null,
        points: null,
        maxPoints: maxAchievablePoints,
        totalParticipants: leaderboard.length,
      });
    }

    return NextResponse.json({
      published: true,
      participant: true,
      rank: mine.rank,
      points: mine.points,
      maxPoints: maxAchievablePoints,
      totalParticipants: leaderboard.length,
      displayName: mine.displayName,
    });
  } catch (e) {
    console.error("GET /api/account/contest-standing", e);
    return NextResponse.json({ error: "Nepodařilo se načíst výsledek soutěže." }, { status: 500 });
  }
}
