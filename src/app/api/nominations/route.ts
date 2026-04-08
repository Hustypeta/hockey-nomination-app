import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro uložení nominace se musíš přihlásit přes Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { selectedPlayerIds, captainId, lineupStructure } = body;

    if (!selectedPlayerIds || !Array.isArray(selectedPlayerIds)) {
      return NextResponse.json(
        { error: "selectedPlayerIds is required" },
        { status: 400 }
      );
    }

    const all = loadMs2026Candidates();
    const byId = new Map(all.map((p) => [p.id, p]));
    const players = selectedPlayerIds
      .map((id: string) => byId.get(id))
      .filter(Boolean) as typeof all;

    if (players.length !== selectedPlayerIds.length) {
      return NextResponse.json(
        { error: "Neplatní hráči v nominaci" },
        { status: 400 }
      );
    }

    const counts = { G: 0, D: 0, F: 0 };
    for (const p of players) {
      if (p.position in counts) counts[p.position as keyof typeof counts]++;
    }
    if (counts.G !== 3 || counts.D !== 8 || counts.F !== 14) {
      return NextResponse.json(
        {
          error: `Neplatná sestava. Potřebujete: 3 brankáři, 8 obránců, 14 útočníků. Máte: ${counts.G}G, ${counts.D}D, ${counts.F}F`,
        },
        { status: 400 }
      );
    }

    const nomination = await prisma.nomination.create({
      data: {
        userId: session.user.id,
        selectedPlayerIds,
        captainId: captainId || null,
        lineupStructure: lineupStructure ?? undefined,
      },
    });

    return NextResponse.json({
      id: nomination.id,
      message: "Nominace uložena",
    });
  } catch (error) {
    console.error("Failed to create nomination:", error);
    return NextResponse.json(
      { error: "Failed to create nomination" },
      { status: 500 }
    );
  }
}
