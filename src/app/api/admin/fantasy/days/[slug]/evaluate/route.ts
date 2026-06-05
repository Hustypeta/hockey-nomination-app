import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { ensureMsFantasyGameDayBySlug, evaluateMsFantasyAdminDay } from "@/lib/msFantasyAdminScoring";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    await requireAdminOrThrow();
    const { slug } = await ctx.params;
    const gameDay = await ensureMsFantasyGameDayBySlug(slug);
    if (!gameDay) {
      return NextResponse.json({ error: "Neznámý hrací den." }, { status: 404 });
    }

    const { results, missingStatPlayerIds } = await evaluateMsFantasyAdminDay(gameDay.id);

    return NextResponse.json({
      ok: true,
      results,
      missingStatPlayerIds,
      warning:
        missingStatPlayerIds.length > 0
          ? `${missingStatPlayerIds.length} hráčů ve sestavách nemá vyplněné statistiky (0 bodů).`
          : null,
    });
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy evaluate:", e);
    return NextResponse.json({ error: "Chyba vyhodnocení." }, { status });
  }
}
