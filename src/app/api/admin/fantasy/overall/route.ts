import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { loadMsFantasyOverallStandings } from "@/lib/msFantasyAdminScoring";

export async function GET() {
  try {
    await requireAdminOrThrow();
    const overall = await loadMsFantasyOverallStandings();
    return NextResponse.json({ overall });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy overall:", e);
    return NextResponse.json({ error: "Chyba načtení celkového pořadí." }, { status });
  }
}
