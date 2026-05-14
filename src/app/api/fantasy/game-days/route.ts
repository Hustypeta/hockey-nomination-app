import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { msFantasyNotEnabledResponse, msFantasyRequireSessionResponse } from "@/lib/msFantasyApiGate";
import { resolveMsFantasyMatchesFromDbOrOfficial } from "@/lib/msFantasyMatchesResolve";
import { ms2026FantasyOfficialLockAtIso } from "@/lib/ms2026FantasyOfficialGameDays";

/** Seznam fantasy hracích dnů — pořadí podle lockAt / sortOrder. U slugů MS 2026 z kódu je `lockAt` vždy z oficiálního kalendáře (stejně jako zápasy), ne ze zastaralé DB. */
export async function GET() {
  const gate = msFantasyNotEnabledResponse();
  if (gate) return gate;

  const authGate = await msFantasyRequireSessionResponse();
  if (authGate) return authGate;

  const rows = await prisma.msFantasyGameDay.findMany({
    orderBy: [{ sortOrder: "asc" }, { lockAt: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      lockAt: true,
      matches: true,
    },
  });

  const now = new Date().getTime();
  return NextResponse.json({
    days: rows.map((d) => {
      const lockIso = ms2026FantasyOfficialLockAtIso(d.slug) ?? d.lockAt.toISOString();
      const lockMs = new Date(lockIso).getTime();
      return {
        ...d,
        matches: resolveMsFantasyMatchesFromDbOrOfficial(d.slug, d.matches),
        lockAt: lockIso,
        isLocked: lockMs <= now,
      };
    }),
  });
}
