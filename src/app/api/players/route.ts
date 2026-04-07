import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { playerFromDb } from "@/lib/playerDto";

export async function GET() {
  try {
    const rows = await prisma.player.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
    const players = rows.map(playerFromDb);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
