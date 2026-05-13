import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { msFantasyNotEnabledResponse, msFantasyRequireSessionResponse } from "@/lib/msFantasyApiGate";

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
    },
  });

  if (!day) return NextResponse.json({ error: "den nenalezen" }, { status: 404 });

  const now = new Date().getTime();
  return NextResponse.json({
    day: {
      ...day,
      lockAt: day.lockAt.toISOString(),
      isLocked: day.lockAt.getTime() <= now,
    },
  });
}
