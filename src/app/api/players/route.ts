import { NextResponse } from "next/server";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";

export async function GET() {
  try {
    const players = loadMs2026Candidates();
    return NextResponse.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
