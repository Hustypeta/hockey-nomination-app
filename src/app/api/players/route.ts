import { NextRequest, NextResponse } from "next/server";
import { collectLineupPlayerIds, isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import { DEFAULT_LINEUP_POOL } from "@/lib/lineupPools";
import { checkLineupDbHealth } from "@/lib/lineupDbHealth";
import {
  computeMatchSavePickRates,
  pickRateFromCounts,
} from "@/lib/matchSavePickRates";
import { loadPlayersForPoolDetailed, listPoolCounts } from "@/lib/playersFromDb";
import { prisma } from "@/lib/prisma";
import type { LineupStructure } from "@/types";

export const dynamic = "force-dynamic";

function issueResponse(issue: string) {
  if (issue === "schema_missing_poolKey") {
    return NextResponse.json(
      {
        error: "Schéma lineup DB se obnovuje — restartuj dev server",
        code: "SCHEMA_MISSING_POOL_KEY",
        hint: "Restartuj `npm run dev` (predev → db:ensure). Trvale: lokální Postgres — viz .env.local.example.",
      },
      { status: 503 }
    );
  }
  if (issue === "all_in_repre_a") {
    return NextResponse.json(
      {
        error: "Všichni hráči jsou v repre_a — ELH pooly chybí",
        code: "ALL_IN_REPRE_A",
        hint: "Spusť `npm run import:lineup-pools` (2 Excely zůstanou odděleně).",
      },
      { status: 503 }
    );
  }
  if (issue === "db_error") {
    return NextResponse.json(
      {
        error: "Nepodařilo se načíst hráče z databáze",
        code: "DB_ERROR",
        hint: "Spusť `npm run db:ensure` a zkontroluj DATABASE_URL.",
      },
      { status: 503 }
    );
  }
  return null;
}

/**
 * Hráči poolu editoru sestavy.
 * `?pool=repre_a` (default) | `repre_u20` | `elh:HC Sparta Praha` | `?meta=1` counts.
 * `?source=saves` — pick_rate z uložených MatchShareLink (Moje sestavy), scoped na pool.
 * Default source — pick_rate z kompletních contest nominací (NominationBuilder).
 */
export async function GET(req: NextRequest) {
  try {
    const meta = req.nextUrl.searchParams.get("meta");
    if (meta === "1" || meta === "pools") {
      const health = await checkLineupDbHealth();
      if (!health.ok) {
        return NextResponse.json(
          {
            pools: [],
            error: health.message,
            code: health.code,
            hint: health.hint,
          },
          { status: 503 }
        );
      }
      const counts = await listPoolCounts();
      return NextResponse.json({
        pools: counts,
        health: { total: health.total, repreA: health.repreA, elh: health.elh },
      });
    }

    const pool = (req.nextUrl.searchParams.get("pool") || DEFAULT_LINEUP_POOL).trim();
    const source = (req.nextUrl.searchParams.get("source") || "").trim().toLowerCase();
    const useMatchSaves = source === "saves" || source === "match_saves";

    const loaded = await loadPlayersForPoolDetailed(pool);
    const blocked = loaded.issue ? issueResponse(loaded.issue) : null;
    if (blocked) return blocked;

    const players = loaded.players;

    if (useMatchSaves) {
      const { pickCounts, completeSaves } = await computeMatchSavePickRates(pool);
      const withRates = players.map((p) => ({
        ...p,
        pick_rate: pickRateFromCounts(p.id, pickCounts, completeSaves),
      }));
      return NextResponse.json(withRates);
    }

    const contestNominations = await prisma.nomination.findMany({
      where: {
        userId: { not: null },
        contestEntryForUser: { isNot: null },
      },
      select: { lineupStructure: true },
    });

    const pickCounts = new Map<string, number>();
    let completeContestEntries = 0;

    for (const row of contestNominations) {
      const raw = row.lineupStructure;
      if (!raw || typeof raw !== "object") continue;
      const ls = normalizeLineupStructure(raw as unknown as LineupStructure);
      if (!isLineupComplete(ls)) continue;
      completeContestEntries += 1;
      for (const id of collectLineupPlayerIds(ls)) {
        pickCounts.set(id, (pickCounts.get(id) ?? 0) + 1);
      }
    }

    const withRates = players.map((p) => ({
      ...p,
      pick_rate:
        completeContestEntries > 0
          ? Math.round((100 * (pickCounts.get(p.id) ?? 0)) / completeContestEntries)
          : 0,
    }));

    return NextResponse.json(withRates);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    const err = error as { code?: string; message?: string; meta?: { column?: string } };
    const msg = String(err.message ?? "");
    const col = String(err.meta?.column ?? "");
    const missingPoolKey =
      err.code === "SCHEMA_MISSING_POOL_KEY" ||
      (err.code === "P2022" &&
        (/players\.poolKey/i.test(msg) || /poolKey/i.test(col)));
    if (missingPoolKey) {
      return NextResponse.json(
        {
          error: "Schéma lineup DB se obnovuje — restartuj dev server",
          code: "SCHEMA_MISSING_POOL_KEY",
          hint: "Restartuj `npm run dev` (predev → db:ensure). Trvale: lokální Postgres — viz .env.local.example.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
