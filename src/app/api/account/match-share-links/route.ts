import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    },
  });

  return NextResponse.json({
    links: links.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  });
}

