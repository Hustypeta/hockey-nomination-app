import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, selectedPlayerIds, captainId, lineupStructure } = body;

    if (!email || !selectedPlayerIds || !Array.isArray(selectedPlayerIds)) {
      return NextResponse.json(
        { error: "Email and selectedPlayerIds are required" },
        { status: 400 }
      );
    }

    // Validate lineup: 3G, 8D, 14F
    const players = await prisma.player.findMany({
      where: { id: { in: selectedPlayerIds } },
    });

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

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    const nomination = await prisma.nomination.create({
      data: {
        userId: user.id,
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
