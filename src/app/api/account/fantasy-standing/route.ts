import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  computeMsFantasyLeaderboard,
  msFantasyLeaderboardIsPublic,
} from "@/lib/msFantasyLeaderboard";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Musíte být přihlášení." }, { status: 401 });
    }

    const published = msFantasyLeaderboardIsPublic();
    if (!published) {
      return NextResponse.json({
        published: false,
        participant: false,
        rank: null,
        points: null,
        daysPlayed: null,
        totalParticipants: 0,
      });
    }

    const { leaderboard } = await computeMsFantasyLeaderboard();
    const mine = leaderboard.find((r) => r.userId === userId);
    if (!mine) {
      return NextResponse.json({
        published: leaderboard.length > 0,
        participant: false,
        rank: null,
        points: null,
        daysPlayed: null,
        totalParticipants: leaderboard.length,
      });
    }

    return NextResponse.json({
      published: true,
      participant: true,
      rank: mine.rank,
      points: mine.totalPoints,
      daysPlayed: mine.daysPlayed,
      totalParticipants: leaderboard.length,
      displayName: mine.displayName,
    });
  } catch (e) {
    console.error("GET /api/account/fantasy-standing", e);
    return NextResponse.json({ error: "Nepodařilo se načíst fantasy výsledek." }, { status: 500 });
  }
}
