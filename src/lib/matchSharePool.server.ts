import { DEFAULT_LINEUP_POOL } from "@/lib/lineupPools";
import {
  majorityPoolKeyFromPlayers,
  normalizeMatchSharePoolKey,
  playerIdsFromMatchLineupStructure,
  resolveMatchSharePoolKey,
} from "@/lib/matchSharePool";
import { prisma } from "@/lib/prisma";

/**
 * Infer pool from player IDs in lineupStructure (DB majority vote).
 * Works for repre_* and elh:* — IDs are unique across pools.
 */
export async function inferPoolKeyFromLineupStructure(
  lineupStructure: unknown
): Promise<string | null> {
  const ids = playerIdsFromMatchLineupStructure(lineupStructure);
  if (ids.length === 0) return null;
  const rows = await prisma.player.findMany({
    where: { id: { in: ids } },
    select: { poolKey: true },
  });
  return majorityPoolKeyFromPlayers(rows);
}

type ShareRow = { code: string; poolKey: string; lineupStructure: unknown };

/**
 * Resolve poolKey for account list / on-read correction.
 *
 * Trust every explicit saved pool (repre_u20/u18/zeny, all elh:*, …).
 * Never remap those to repre_a. Only when stored is default/missing, recover
 * the real pool from player IDs (fixes historical cand_* → A-tým force).
 */
export async function backfillMatchSharePoolKeys(
  rows: ReadonlyArray<ShareRow>
): Promise<Map<string, string>> {
  const resolved = new Map<string, string>();
  const updates: { code: string; poolKey: string }[] = [];

  /** Only default/missing rows need a DB lookup — explicit pools are trusted. */
  const needsInfer: ShareRow[] = [];
  for (const row of rows) {
    const key = normalizeMatchSharePoolKey(row.poolKey);
    if (key !== DEFAULT_LINEUP_POOL) {
      resolved.set(row.code, key);
    } else {
      needsInfer.push(row);
    }
  }

  if (needsInfer.length > 0) {
    const allIds = new Set<string>();
    const idsByCode = new Map<string, string[]>();
    for (const row of needsInfer) {
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

    for (const row of needsInfer) {
      const ids = idsByCode.get(row.code) ?? [];
      const pools = ids
        .map((id) => poolByPlayerId.get(id))
        .filter((k): k is string => typeof k === "string");
      const inferred = majorityPoolKeyFromPlayers(pools.map((poolKey) => ({ poolKey })));
      const finalKey = resolveMatchSharePoolKey({
        storedPoolKey: row.poolKey,
        inferredFromPlayers: inferred,
      });
      resolved.set(row.code, finalKey);
      if (finalKey !== normalizeMatchSharePoolKey(row.poolKey)) {
        updates.push({ code: row.code, poolKey: finalKey });
      }
    }
  }

  await Promise.all(
    updates.map((u) =>
      prisma.matchShareLink.update({
        where: { code: u.code },
        data: { poolKey: u.poolKey },
      })
    )
  );

  return resolved;
}
