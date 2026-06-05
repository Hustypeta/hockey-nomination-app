import { NextResponse } from "next/server";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";
import { loadMsFantasyAdminDay } from "@/lib/msFantasyAdminScoring";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    await requireAdminOrThrow();
    const { slug } = await ctx.params;
    const data = await loadMsFantasyAdminDay(slug);
    if (!data) {
      return NextResponse.json({ error: "Neznámý hrací den." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    const status = getThrownStatus(e) ?? 500;
    if (status === 401) return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
    console.error("admin fantasy day:", e);
    return NextResponse.json({ error: "Chyba načtení dne." }, { status });
  }
}
