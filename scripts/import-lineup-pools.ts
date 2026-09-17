/**
 * Import data/lineup-pools-import.json → Prisma `players` (poolKey sekce).
 *
 * Workflow:
 *   python scripts/export-lineup-pools-json.py
 *   npx ts-node --project scripts/tsconfig.json scripts/import-lineup-pools.ts
 *
 * Nebo: npm run import:lineup-pools
 *
 * Safety:
 * - Every row must have an explicit poolKey (no silent default to repre_a).
 * - A-tym / repre_a must not absorb ELH club players.
 * - Known lineup pools are wiped first, then recreated from the JSON.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { leagueForClub } from "../src/lib/clubLeague";
import {
  ELH_CLUBS,
  REPRE_POOLS,
  elhPoolKey,
  isElhPoolKey,
  isKnownPoolKey,
} from "../src/lib/lineupPools";

loadEnv({ path: join(process.cwd(), ".env.local"), override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type ImportRow = {
  id: string;
  name: string;
  position: string;
  role?: string | null;
  club: string;
  /** From Excel `liga` when present (e.g. Tipsport Extraliga). */
  league?: string | null;
  jerseyNumber?: number | null;
  poolKey: string;
};

function resolveImportLeague(p: ImportRow): string {
  const fromExcel = p.league?.trim();
  if (fromExcel && !["–", "-", "—"].includes(fromExcel)) return fromExcel;
  return leagueForClub(p.club.trim());
}

/** All editor pools we manage — wipe these even if a pool is empty in this export. */
function allManagedPoolKeys(): string[] {
  return [...REPRE_POOLS.map((p) => p.key), ...ELH_CLUBS.map((c) => elhPoolKey(c))];
}

function countByPool(rows: ImportRow[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.poolKey, (m.get(r.poolKey) ?? 0) + 1);
  return m;
}

function assertImportSafe(rows: ImportRow[]): void {
  const missingKey = rows.filter((r) => !r.poolKey?.trim());
  if (missingKey.length) {
    throw new Error(`${missingKey.length} rows missing poolKey — refusing import (would default to repre_a).`);
  }

  const unknown = [...new Set(rows.map((r) => r.poolKey))].filter((k) => !isKnownPoolKey(k));
  if (unknown.length) {
    console.warn("Unknown poolKeys (still importing):", unknown.join(", "));
  }

  const byPool = countByPool(rows);
  const repreA = byPool.get("repre_a") ?? 0;
  const elhTotal = [...byPool.entries()].filter(([k]) => isElhPoolKey(k)).reduce((s, [, n]) => s + n, 0);

  // Guard: never dump the whole file into A-tým
  if (rows.length > 250 && repreA === rows.length) {
    throw new Error(
      `Refusing import: all ${rows.length} players have poolKey=repre_a. ` +
        `A-tym must stay ~Excel A-tym only; ELH clubs must use elh:<club>. Re-run export-lineup-pools-json.py.`
    );
  }
  if (elhTotal > 0 && repreA >= rows.length * 0.85) {
    throw new Error(
      `Refusing import: repre_a has ${repreA}/${rows.length} players while ELH rows exist (${elhTotal}). ` +
        `Likely mis-assigned poolKeys.`
    );
  }
  if (repreA > 220) {
    throw new Error(
      `Refusing import: repre_a count ${repreA} looks inflated (Excel A-tym is ~171). Check export.`
    );
  }

  console.log(`Validation OK: repre_a=${repreA}, elh=${elhTotal}, other=${rows.length - repreA - elhTotal}`);
}

async function main() {
  const path = join(process.cwd(), "data", "lineup-pools-import.json");
  if (!existsSync(path)) {
    throw new Error(`Missing ${path} — run: python scripts/export-lineup-pools-json.py`);
  }
  const raw = JSON.parse(readFileSync(path, "utf-8")) as { players?: ImportRow[] };
  const rows = (raw.players ?? []).filter((p) => p?.id && p?.name && p?.poolKey);
  if (rows.length === 0) throw new Error("No players in lineup-pools-import.json");

  assertImportSafe(rows);

  const managed = allManagedPoolKeys();
  const byPool = countByPool(rows);
  console.log(`Importing ${rows.length} players across ${byPool.size} pools (wiping ${managed.length} managed pools)…`);

  const before = await prisma.player.groupBy({
    by: ["poolKey"],
    _count: { _all: true },
    orderBy: { poolKey: "asc" },
  });
  console.log("Before:");
  for (const c of before) {
    console.log(`  ${c.poolKey}: ${c._count._all}`);
  }

  await prisma.$transaction(async (tx) => {
    // Full clean of lineup-editor pools so leftover mis-tagged rows (e.g. all under repre_a) cannot linger.
    await tx.player.deleteMany({
      where: {
        OR: [{ poolKey: { in: managed } }, { poolKey: { startsWith: "elh:" } }],
      },
    });
    await tx.player.createMany({
      data: rows.map((p) => {
        const poolKey = p.poolKey.trim();
        if (!poolKey) throw new Error(`Empty poolKey for ${p.id}`);
        return {
          id: p.id,
          name: p.name.trim(),
          position: p.position,
          role: p.role?.trim() || null,
          club: p.club.trim(),
          league: resolveImportLeague(p),
          jerseyNumber: p.jerseyNumber ?? null,
          poolKey,
        };
      }),
    });
  });

  const counts = await prisma.player.groupBy({
    by: ["poolKey"],
    _count: { _all: true },
    orderBy: { poolKey: "asc" },
  });
  console.log("After:");
  for (const c of counts) {
    console.log(`  ${c.poolKey}: ${c._count._all}`);
  }
  const repreAfter = counts.find((c) => c.poolKey === "repre_a")?._count._all ?? 0;
  const totalAfter = counts.reduce((s, c) => s + c._count._all, 0);
  const sparta = counts.find((c) => c.poolKey === "elh:HC Sparta Praha")?._count._all ?? 0;
  console.log(`Done. repre_a=${repreAfter}, total=${totalAfter}, Sparta=${sparta}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
