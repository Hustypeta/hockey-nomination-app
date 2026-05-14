import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { msFantasyNotEnabledResponse, msFantasyRequireSessionResponse } from "@/lib/msFantasyApiGate";
import { resolveMsFantasyMatchesFromDbOrOfficial } from "@/lib/msFantasyMatchesResolve";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const gate = msFantasyNotEnabledResponse();
  if (gate) return gate;

  const authGate = await msFantasyRequireSessionResponse();
  if (authGate) return authGate;

  const { slug } = await ctx.params;

  const day = await prisma.msFantasyGameDay.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      lockAt: true,
      matches: true,
    },
  });

  if (!day) return NextResponse.json({ error: "den nenalezen" }, { status: 404 });

  const now = new Date().getTime();
  return NextResponse.json({
    day: {
      ...day,
      matches: resolveMsFantasyMatchesFromDbOrOfficial(day.slug, day.matches),
      lockAt: day.lockAt.toISOString(),
      isLocked: day.lockAt.getTime() <= now,
    },
  });
}
