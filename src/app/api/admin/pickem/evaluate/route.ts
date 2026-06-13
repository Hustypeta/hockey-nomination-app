import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { computePickemLeaderboard } from "@/lib/pickemLeaderboard";

async function evaluatePickem() {
  const result = await computePickemLeaderboard();
  if (!result.officialUpdatedAt) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Chybí oficiální výsledky Pick'em — nejdřív ulož payload přes POST /api/admin/pickem/official-results.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    officialUpdatedAt: result.officialUpdatedAt,
    entriesTotal: result.entriesTotal,
    entriesEvaluated: result.entriesEvaluated,
    entriesSkipped: result.entriesSkipped,
    leaderboard: result.leaderboard,
  });
}

/** Náhled vyhodnocení — vrátí žebříček všech soutěžních Pick'em záznamů. */
export async function GET() {
  try {
    await requireAdminOrThrow();
    return evaluatePickem();
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin pickem evaluate GET:", e);
    return NextResponse.json({ error: "Chyba vyhodnocení Pick'em." }, { status });
  }
}

/** Stejné jako GET — vyhodnocení všech soutěžních tipů proti oficiálním výsledkům. */
export async function POST() {
  try {
    await requireAdminOrThrow();
    return evaluatePickem();
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin pickem evaluate POST:", e);
    return NextResponse.json({ error: "Chyba vyhodnocení Pick'em." }, { status });
  }
}
