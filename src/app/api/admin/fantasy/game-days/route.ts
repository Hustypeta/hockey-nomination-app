import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { listMsFantasyAdminGameDays } from "@/lib/msFantasyAdminScoring";

export async function GET() {
  try {
    await requireAdminOrThrow();
    const days = await listMsFantasyAdminGameDays();
    return NextResponse.json({ days });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy game-days:", e);
    return NextResponse.json({ error: "Chyba načtení dnů." }, { status });
  }
}
