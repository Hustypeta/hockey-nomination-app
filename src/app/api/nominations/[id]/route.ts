import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePlayersByIds } from "@/lib/resolveNominationPlayers";

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

    const orderedPlayers = await resolvePlayersByIds(nomination.selectedPlayerIds);

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
