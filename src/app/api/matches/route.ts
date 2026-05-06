import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: { published: true },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        opponent: true,
        startsAt: true,
        venue: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ matches });
  } catch (e) {
    console.error("GET /api/matches:", e);
    return NextResponse.json({ error: "Chyba." }, { status: 500 });
  }
}

