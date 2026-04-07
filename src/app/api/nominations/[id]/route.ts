import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { playerFromDb } from "@/lib/playerDto";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const nomination = await prisma.nomination.findUnique({
      where: { id },
    });

    if (!nomination) {
      return NextResponse.json({ error: "Nominace nenalezena" }, { status: 404 });
    }

    const players = await prisma.player.findMany({
      where: { id: { in: nomination.selectedPlayerIds } },
    });

    const orderedPlayers = nomination.selectedPlayerIds
      .map((pid) => players.find((p) => p.id === pid))
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map(playerFromDb);

    return NextResponse.json({
      id: nomination.id,
      captainId: nomination.captainId,
      players: orderedPlayers,
      createdAt: nomination.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch nomination:", error);
    return NextResponse.json(
      { error: "Failed to fetch nomination" },
      { status: 500 }
    );
  }
}
