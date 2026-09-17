import { prisma } from "@/lib/prisma";

export type LineupDbHealth =
  | { ok: true; total: number; repreA: number; elh: number }
  | {
      ok: false;
      code: "SCHEMA_MISSING_POOL_KEY" | "EMPTY_PLAYERS" | "ALL_IN_REPRE_A" | "DB_ERROR";
      message: string;
      hint: string;
    };

function isMissingPoolKeyColumn(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { code?: string; message?: string; meta?: { column?: string } };
  if (err.code !== "P2022") return false;
  const msg = String(err.message ?? "");
  const col = String(err.meta?.column ?? "");
  // Only treat as missing poolKey when the error names that column — never map every P2022.
  return /players\.poolKey/i.test(msg) || /(?:^|[.\s"])poolKey(?:$|[.\s"])/i.test(col + " " + msg);
}

const FIX_SCHEMA =
  "Restartuj `npm run dev` (predev → db:ensure sloupec doplní). Trvale: lokální Postgres — viz .env.local.example.";
const FIX_IMPORT =
  "Spusť `npm run import:lineup-pools` (export z obou Excelů → DB). Excely nech odděleně — neslučovat.";

/** Self-check for lineup editor pools — actionable hints, not panic. */
export async function checkLineupDbHealth(): Promise<LineupDbHealth> {
  try {
    const counts = await prisma.player.groupBy({
      by: ["poolKey"],
      _count: { _all: true },
      orderBy: { poolKey: "asc" },
    });
    const total = counts.reduce((s, c) => s + c._count._all, 0);
    const repreA = counts.find((c) => c.poolKey === "repre_a")?._count._all ?? 0;
    const elh = counts
      .filter((c) => c.poolKey.startsWith("elh:"))
      .reduce((s, c) => s + c._count._all, 0);

    if (total === 0) {
      return {
        ok: false,
        code: "EMPTY_PLAYERS",
        message: "Tabulka players je prázdná",
        hint: FIX_IMPORT,
      };
    }

    // Classic mis-import / missing poolKey default dump
    if (elh === 0 && repreA === total && total > 220) {
      return {
        ok: false,
        code: "ALL_IN_REPRE_A",
        message: `Všichni hráči (${total}) jsou v repre_a — ELH pooly chybí`,
        hint: FIX_IMPORT,
      };
    }

    return { ok: true, total, repreA, elh };
  } catch (e) {
    if (isMissingPoolKeyColumn(e)) {
      return {
        ok: false,
        code: "SCHEMA_MISSING_POOL_KEY",
        message: "Schéma lineup DB se obnovuje — restartuj dev server",
        hint: FIX_SCHEMA,
      };
    }
    console.error("checkLineupDbHealth:", e);
    return {
      ok: false,
      code: "DB_ERROR",
      message: "Nepodařilo se ověřit players pooly",
      hint: FIX_SCHEMA,
    };
  }
}
