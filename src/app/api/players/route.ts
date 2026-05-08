import { NextResponse } from "next/server";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import { collectLineupPlayerIds, isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import { prisma } from "@/lib/prisma";
import type { LineupStructure } from "@/types";

export const dynamic = "force-dynamic";

/** Podíl výskytu hráče mezi odeslanými nominacemi do soutěže (kompletní sestavy). */
export async function GET() {
  try {
    const players = loadMs2026Candidates();

    const contestNominations = await prisma.nomination.findMany({
      where: {
        userId: { not: null },
        contestEntryForUser: { isNot: null },
      },
      select: { lineupStructure: true },
    });

    const pickCounts = new Map<string, number>();
    let completeContestEntries = 0;

    for (const row of contestNominations) {
      const raw = row.lineupStructure;
      if (!raw || typeof raw !== "object") continue;
      const ls = normalizeLineupStructure(raw as unknown as LineupStructure);
      if (!isLineupComplete(ls)) continue;
      completeContestEntries += 1;
      for (const id of collectLineupPlayerIds(ls)) {
        pickCounts.set(id, (pickCounts.get(id) ?? 0) + 1);
      }
    }

    const withRates = players.map((p) => ({
      ...p,
      pick_rate:
        completeContestEntries > 0
          ? Math.round((100 * (pickCounts.get(p.id) ?? 0)) / completeContestEntries)
          : 0,
    }));

    return NextResponse.json(withRates);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
