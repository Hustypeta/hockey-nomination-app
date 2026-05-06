import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const whereCategory = category === "ms2026" ? "ms2026" : category === "beijir" ? "beijir" : null;
    const matches = await prisma.match.findMany({
      where: { published: true, ...(whereCategory ? { category: whereCategory } : {}) },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        homeCode: true,
        awayCode: true,
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

