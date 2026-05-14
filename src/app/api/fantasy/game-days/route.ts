import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { msFantasyNotEnabledResponse, msFantasyRequireSessionResponse } from "@/lib/msFantasyApiGate";

/** Seznam fantasy hracích dnů — pořadí podle lockAt / sortOrder. */
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
    days: rows.map((d) => ({
      ...d,
      lockAt: d.lockAt.toISOString(),
      isLocked: d.lockAt.getTime() <= now,
    })),
  });
}
