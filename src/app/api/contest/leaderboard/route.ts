import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { scoreNominationAgainstOfficial } from "@/lib/contestScoring";
import { prisma } from "@/lib/prisma";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";
import { publicLeaderboardDisplayName } from "@/lib/publicUserLabel";

const OFFICIAL_ID = "official";

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

/** Zapne fanouškovské čtení žebříčku (`CONTEST_LEADERBOARD_PUBLIC=true`). */
function leaderboardWantsPublic(): boolean {
  return process.env.CONTEST_LEADERBOARD_PUBLIC?.trim().toLowerCase() === "true";
}

/**
 * Jednoznačně vypne veřejné výsledky i když někdo omylem nechal `CONTEST_LEADERBOARD_PUBLIC=true` (test / staging).
 * Na produkci nastav `CONTEST_LEADERBOARD_FORCE_OFF=true`, dokud nechceš žebříček skutečně ukázat.
 */
function leaderboardForceOff(): boolean {
  return process.env.CONTEST_LEADERBOARD_FORCE_OFF?.trim().toLowerCase() === "true";
}

function leaderboardIsPublic(): boolean {
  if (leaderboardForceOff()) return false;
  return leaderboardWantsPublic();
}

export async function GET() {
  try {
    if (!leaderboardIsPublic() && !(await isAdmin())) {
      return NextResponse.json({
        published: false,
        hidden: true,
        updatedAt: null as string | null,
        leaderboard: [],
      });
    }

    const official = await prisma.officialLineup.findUnique({ where: { id: OFFICIAL_ID } });
    if (!official?.lineupStructure) {
      return NextResponse.json({
        published: false,
        hidden: false,
        updatedAt: null as string | null,
        leaderboard: [] as Array<{
          nominationId: string;
          userId: string;
          displayName: string;
          image: string | null;
          points: number;
          createdAt: string;
          breakdown: {
            basePlayerPoints: number;
            playerPointsAfterTimeBonus: number;
            captainBonus: number;
            assistantBonus: number;
            timeBonusPercent: number;
          };
        }>,
      });
    }

    const officialLineup = normalizeLineupStructure(official.lineupStructure as unknown as LineupStructure);

    const nominations = await prisma.nomination.findMany({
      where: {
        userId: { not: null },
        contestEntryForUser: { isNot: null },
      },
      include: {
        user: { select: { id: true, leaderboardNickname: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const rows: Array<{
      nominationId: string;
      userId: string;
      displayName: string;
      image: string | null;
      points: number;
      createdAt: string;
      breakdown: {
        basePlayerPoints: number;
        playerPointsAfterTimeBonus: number;
        captainBonus: number;
        assistantBonus: number;
        timeBonusPercent: number;
      };
    }> = [];

    for (const n of nominations) {
      if (!n.userId || !n.lineupStructure || !n.user) continue;
      const ls = normalizeLineupStructure(n.lineupStructure as unknown as LineupStructure);
      if (!isLineupComplete(ls)) continue;

      const breakdown = scoreNominationAgainstOfficial(
        ls,
        officialLineup,
        n.captainId,
        official.captainId,
        n.timeBonusPercent
      );

      const displayName = publicLeaderboardDisplayName({
        userId: n.userId,
        nickname: n.user.leaderboardNickname,
      });

      rows.push({
        nominationId: n.id,
        userId: n.userId,
        displayName,
        image: n.user.image ?? null,
        points: breakdown.totalPoints,
        createdAt: n.createdAt.toISOString(),
        breakdown: {
          basePlayerPoints: breakdown.basePlayerPoints,
          playerPointsAfterTimeBonus: breakdown.playerPointsAfterTimeBonus,
          captainBonus: breakdown.captainBonus,
          assistantBonus: breakdown.assistantBonus,
          timeBonusPercent: breakdown.timeBonusPercent,
        },
      });
    }

    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));

    return NextResponse.json({
      published: true,
      hidden: false,
      updatedAt: official.updatedAt.toISOString(),
      leaderboard: ranked,
    });
  } catch (e) {
    console.error("leaderboard:", e);
    return NextResponse.json({ error: "Žebříček se nepodařilo načíst." }, { status: 500 });
  }
}
