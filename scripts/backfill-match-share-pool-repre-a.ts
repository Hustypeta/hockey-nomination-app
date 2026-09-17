/**
 * One-off maintenance for MatchShareLink.poolKey.
 *
 * Default (safe): only fill missing / unknown poolKey from player-ID majority in DB.
 * Never remaps explicit repre_u20 / u18 / zeny / elh:* → repre_a.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register --project scripts/tsconfig.json scripts/backfill-match-share-pool-repre-a.ts
 *   ... --dry-run
 *
 * Dangerous (legacy, do not use for normal ops):
 *   ... --all-elh   # force every elh:* → repre_a
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_LINEUP_POOL, isElhPoolKey, isKnownPoolKey } from "../src/lib/lineupPools";
import {
  majorityPoolKeyFromPlayers,
  playerIdsFromMatchLineupStructure,
  resolveMatchSharePoolKey,
} from "../src/lib/matchSharePool";

const root = process.cwd();
if (existsSync(join(root, ".env.local"))) config({ path: join(root, ".env.local"), override: true });
if (existsSync(join(root, ".env"))) config({ path: join(root, ".env") });

const prisma = new PrismaClient();

const dryRun = process.argv.includes("--dry-run");
const allElh = process.argv.includes("--all-elh");

async function main() {
  const links = await prisma.matchShareLink.findMany({
    select: { code: true, poolKey: true, title: true, createdAt: true, lineupStructure: true, userId: true },
    orderBy: { createdAt: "asc" },
  });

  const toUpdate: { code: string; from: string; to: string; reason: string }[] = [];

  if (allElh) {
    console.warn("WARNING: --all-elh forces every elh:* poolKey → repre_a (destroys club saves).");
    for (const row of links) {
      const key = (row.poolKey ?? "").trim();
      if (isElhPoolKey(key)) {
        toUpdate.push({ code: row.code, from: key, to: DEFAULT_LINEUP_POOL, reason: "all_elh_flag" });
      }
    }
  } else {
    const needInfer = links.filter((row) => {
      const key = (row.poolKey ?? "").trim();
      return !key || !isKnownPoolKey(key) || key === DEFAULT_LINEUP_POOL;
    });

    const allIds = new Set<string>();
    const idsByCode = new Map<string, string[]>();
    for (const row of needInfer) {
      const ids = playerIdsFromMatchLineupStructure(row.lineupStructure);
      idsByCode.set(row.code, ids);
      for (const id of ids) allIds.add(id);
    }

    const playerRows =
      allIds.size > 0
        ? await prisma.player.findMany({
            where: { id: { in: [...allIds] } },
            select: { id: true, poolKey: true },
          })
        : [];
    const poolByPlayerId = new Map(playerRows.map((p) => [p.id, p.poolKey]));

    for (const row of needInfer) {
      const key = (row.poolKey ?? "").trim();
      const ids = idsByCode.get(row.code) ?? [];
      const pools = ids
        .map((id) => poolByPlayerId.get(id))
        .filter((k): k is string => typeof k === "string");
      const inferred = majorityPoolKeyFromPlayers(pools.map((poolKey) => ({ poolKey })));
      const finalKey = resolveMatchSharePoolKey({
        storedPoolKey: key || DEFAULT_LINEUP_POOL,
        inferredFromPlayers: inferred,
      });
      if (finalKey !== (isKnownPoolKey(key) ? key : DEFAULT_LINEUP_POOL)) {
        toUpdate.push({
          code: row.code,
          from: key || "(empty)",
          to: finalKey,
          reason: !key || !isKnownPoolKey(key) ? "missing_or_unknown" : "recover_from_players",
        });
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        allElh,
        totalLinks: links.length,
        alreadyRepreA: links.filter((l) => l.poolKey === DEFAULT_LINEUP_POOL).length,
        toUpdate: toUpdate.length,
        reasons: toUpdate.reduce<Record<string, number>>((acc, u) => {
          acc[u.reason] = (acc[u.reason] ?? 0) + 1;
          return acc;
        }, {}),
        sample: toUpdate.slice(0, 15),
      },
      null,
      2
    )
  );

  if (!dryRun && toUpdate.length > 0) {
    for (const u of toUpdate) {
      await prisma.matchShareLink.update({
        where: { code: u.code },
        data: { poolKey: u.to },
      });
    }
    console.log("updated", toUpdate.length);
  }

  const after = await prisma.matchShareLink.groupBy({
    by: ["poolKey"],
    _count: { _all: true },
    orderBy: { _count: { poolKey: "desc" } },
  });
  console.log("BY_POOL_AFTER", JSON.stringify(after, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
