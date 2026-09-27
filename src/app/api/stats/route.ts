import { NextResponse } from "next/server";
import { getContestStatsSnapshot } from "@/lib/contestStats";

export const dynamic = "force-dynamic";

/**
 * Veřejné statistiky pro landing (konverze / social proof) + stav časového bonusu.
 * Pick’emy = jen účty, které jednou odeslaly tip do soutěže (`contestSubmittedAt`), ne rozpracované koncepty.
 */
export async function GET() {
  return NextResponse.json(await getContestStatsSnapshot());
}
