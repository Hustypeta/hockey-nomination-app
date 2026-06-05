import { NextRequest, NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import {
  ensureMsFantasyGameDayBySlug,
  loadMsFantasyAdminDay,
  saveMsFantasyAdminDayStats,
  type FantasyAdminStatInput,
} from "@/lib/msFantasyAdminScoring";

type Ctx = { params: Promise<{ slug: string }> };

function parseStatsBody(body: unknown): FantasyAdminStatInput[] {
  if (typeof body !== "object" || body === null || !("stats" in body)) return [];
  const stats = (body as { stats: unknown }).stats;
  if (!Array.isArray(stats)) return [];
  return stats
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row) => ({
      rosterPlayerId: String(row.rosterPlayerId ?? ""),
      goals: row.goals as number | undefined,
      assists: row.assists as number | undefined,
      plusMinus: row.plusMinus as number | undefined,
      wins: row.wins as number | undefined,
      goalsAgainst: row.goalsAgainst as number | undefined,
      shutouts: row.shutouts as number | undefined,
    }))
    .filter((row) => row.rosterPlayerId.length > 0);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminOrThrow();
    const { slug } = await ctx.params;
    const gameDay = await ensureMsFantasyGameDayBySlug(slug);
    if (!gameDay) {
      return NextResponse.json({ error: "Neznámý hrací den." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const stats = parseStatsBody(body);
    await saveMsFantasyAdminDayStats(gameDay.id, stats);

    const day = await loadMsFantasyAdminDay(slug);
    return NextResponse.json({ ok: true, day });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy stats:", e);
    return NextResponse.json({ error: "Chyba uložení statistik." }, { status });
  }
}
