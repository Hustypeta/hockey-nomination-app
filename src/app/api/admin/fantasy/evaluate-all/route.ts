import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { evaluateMsFantasyAllDays } from "@/lib/msFantasyAdminScoring";

export async function POST() {
  try {
    await requireAdminOrThrow();
    const { daysEvaluated, warnings, overall } = await evaluateMsFantasyAllDays();
    return NextResponse.json({
      ok: true,
      daysEvaluated,
      warnings,
      overall,
    });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy evaluate-all:", e);
    return NextResponse.json({ error: "Chyba hromadného vyhodnocení." }, { status });
  }
}
