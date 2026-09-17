import {
  majorityPoolKeyFromPlayers,
  normalizeMatchSharePoolKey,
  playerIdsFromMatchLineupStructure,
  resolveMatchSharePoolKey,
} from "@/lib/matchSharePool";
import {
  collectMatchLineupIds,
  isMatchLineupComplete,
  type MatchLineupRules,
} from "@/lib/matchLineupValidation";
import { DEFAULT_LINEUP_POOL } from "@/lib/lineupPools";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { prisma } from "@/lib/prisma";
import type { LineupStructure } from "@/types";

type ShareRow = {
  code: string;
  poolKey: string;
  lineupStructure: unknown;
  defenseCount: number;
  allowExtraForward: boolean;
};

function matchRulesFromRow(row: ShareRow): MatchLineupRules {
  const defenseCount =
    row.defenseCount === 6 || row.defenseCount === 7 || row.defenseCount === 8
      ? row.defenseCount
      : 8;
  return { defenseCount, allowExtraForward: Boolean(row.allowExtraForward) };
}

/**
 * Resolve effective poolKey for save rows without writing back.
 * Explicit non-default pools are trusted; default/missing may be inferred from player IDs.
 */
async function resolveEffectivePoolKeys(
  rows: ReadonlyArray<Pick<ShareRow, "code" | "poolKey" | "lineupStructure">>
): Promise<Map<string, string>> {
  const resolved = new Map<string, string>();
  const needsInfer: Array<Pick<ShareRow, "code" | "poolKey" | "lineupStructure">> = [];

  for (const row of rows) {
    const key = normalizeMatchSharePoolKey(row.poolKey);
    if (key !== DEFAULT_LINEUP_POOL) {
      resolved.set(row.code, key);
    } else {
      needsInfer.push(row);
    }
  }

  if (needsInfer.length === 0) return resolved;

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
    resolved.set(
      row.code,
      resolveMatchSharePoolKey({
        storedPoolKey: row.poolKey,
        inferredFromPlayers: inferred,
      })
    );
  }

  return resolved;
}

/**
 * How often each player appears in complete saved MatchShareLink lineups for `pool`.
 * pick_rate = round(100 * count / total_complete_saves_in_pool); empty → all 0.
 */
export async function computeMatchSavePickRates(pool: string): Promise<{
  pickCounts: Map<string, number>;
  completeSaves: number;
}> {
  const poolKey = normalizeMatchSharePoolKey(pool);

  // Exact pool + default-tagged rows (may infer into / out of the requested pool).
  const links = await prisma.matchShareLink.findMany({
    where:
      poolKey === DEFAULT_LINEUP_POOL
        ? { poolKey: DEFAULT_LINEUP_POOL }
        : { poolKey: { in: [poolKey, DEFAULT_LINEUP_POOL] } },
    select: {
      code: true,
      poolKey: true,
      lineupStructure: true,
      defenseCount: true,
      allowExtraForward: true,
    },
  });

  const effectivePools = await resolveEffectivePoolKeys(links);
  const pickCounts = new Map<string, number>();
  let completeSaves = 0;

  for (const row of links) {
    if ((effectivePools.get(row.code) ?? normalizeMatchSharePoolKey(row.poolKey)) !== poolKey) {
      continue;
    }

    const raw = row.lineupStructure;
    if (!raw || typeof raw !== "object") continue;

    const ls = normalizeLineupStructure(raw as unknown as LineupStructure, { mode: "match" });
    const rules = matchRulesFromRow(row);
    if (!isMatchLineupComplete(ls, rules)) continue;

    completeSaves += 1;
    for (const id of collectMatchLineupIds(ls, rules)) {
      pickCounts.set(id, (pickCounts.get(id) ?? 0) + 1);
    }
  }

  return { pickCounts, completeSaves };
}

export function pickRateFromCounts(
  playerId: string,
  pickCounts: Map<string, number>,
  completeSaves: number
): number {
  if (completeSaves <= 0) return 0;
  return Math.round((100 * (pickCounts.get(playerId) ?? 0)) / completeSaves);
}
