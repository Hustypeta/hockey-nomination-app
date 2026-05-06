import path from "node:path";
import dotenv from "dotenv";

// `next dev` automaticky načítá `.env.local`, ale `ts-node` skripty ne.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: false });

import { prisma } from "@/lib/prisma";
import { scoreNominationAgainstOfficial } from "@/lib/contestScoring";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

const OFFICIAL_ID = "official";

function formatName(user: { name: string | null; email: string | null }): string {
  const n = user.name?.trim();
  if (n) return n;
  const e = user.email?.split("@")[0]?.trim();
  return e || "Hráč";
}

async function main() {
  const official = await prisma.officialLineup.findUnique({ where: { id: OFFICIAL_ID } });
  if (!official?.lineupStructure) {
    console.error("Missing official lineup. Upload it via /admin/{CONTEST_ADMIN_ACCESS_KEY} first.");
    process.exitCode = 2;
    return;
  }

  const officialLineup = normalizeLineupStructure(official.lineupStructure as unknown as LineupStructure);

  const nominations = await prisma.nomination.findMany({
    where: {
      userId: { not: null },
      contestEntryForUser: { isNot: null },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: Array<{
    nominationId: string;
    userId: string;
    displayName: string;
    points: number;
    createdAt: string;
    breakdown: ReturnType<typeof scoreNominationAgainstOfficial>;
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

    rows.push({
      nominationId: n.id,
      userId: n.userId,
      displayName: formatName(n.user),
      points: breakdown.totalPoints,
      createdAt: n.createdAt.toISOString(),
      breakdown,
    });
  }

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const top = 50;
  console.log(`Computed ${rows.length} contest entries. Showing top ${Math.min(top, rows.length)}:\n`);
  rows.slice(0, top).forEach((r, i) => {
    const b = r.breakdown;
    console.log(
      [
        String(i + 1).padStart(2, " "),
        r.points.toString().padStart(3, " "),
        "-",
        r.displayName,
        `(${r.nominationId})`,
        `players=${b.playerPointsAfterTimeBonus} (base=${b.basePlayerPoints}, +${b.timeBonusPercent}%)`,
        `C=${b.captainBonus}`,
        `A=${b.assistantBonus}`,
      ].join(" ")
    );
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

