import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeMatchSharePoolKey } from "@/lib/matchSharePool";
import { backfillMatchSharePoolKeys } from "@/lib/matchSharePool.server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ links: [] }, { status: 401 });
  }

  const links = await prisma.matchShareLink.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      code: true,
      slug: true,
      title: true,
      createdAt: true,
      defenseCount: true,
      allowExtraForward: true,
      lineupStructure: true,
      poolKey: true,
    },
  });

  const poolByCode = await backfillMatchSharePoolKeys(links);

  return NextResponse.json({
    links: links.map((l) => ({
      code: l.code,
      slug: l.slug,
      title: l.title,
      createdAt: l.createdAt.toISOString(),
      defenseCount: l.defenseCount,
      allowExtraForward: l.allowExtraForward,
      lineupStructure: l.lineupStructure,
      poolKey: poolByCode.get(l.code) ?? normalizeMatchSharePoolKey(l.poolKey),
    })),
  });
}
