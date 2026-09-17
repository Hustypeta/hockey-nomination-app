import { lineupPlayerIds } from "@/lib/lineupAssign";
import { DEFAULT_LINEUP_POOL, isKnownPoolKey } from "@/lib/lineupPools";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

/** Normalize optional poolKey from API / query — unknown → default. */
export function normalizeMatchSharePoolKey(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_LINEUP_POOL;
  const key = raw.trim();
  if (!key) return DEFAULT_LINEUP_POOL;
  if (isKnownPoolKey(key)) return key;
  return DEFAULT_LINEUP_POOL;
}

/** Player IDs embedded in a saved match lineup JSON. */
export function playerIdsFromMatchLineupStructure(lineupStructure: unknown): string[] {
  if (!lineupStructure || typeof lineupStructure !== "object") return [];
  try {
    const normalized = normalizeLineupStructure(lineupStructure as LineupStructure, { mode: "match" });
    return [...lineupPlayerIds(normalized)];
  } catch {
    return [];
  }
}

/**
 * True when lineup embeds any cand_* player ID.
 * NOTE: A-tým / U20 / U18 may all use cand_* — never treat this as proof of A-tým.
 */
export function looksLikeCandPlayerIds(lineupStructure: unknown): boolean {
  const ids = playerIdsFromMatchLineupStructure(lineupStructure);
  if (ids.length === 0) return false;
  return ids.some((id) => id.startsWith("cand_"));
}

/** @deprecated Use looksLikeCandPlayerIds — cand_* ≠ A-tým. */
export function looksLikeNationalMsLineup(lineupStructure: unknown): boolean {
  return looksLikeCandPlayerIds(lineupStructure);
}

/**
 * Majority vote of Player.poolKey for IDs in the lineup.
 * Returns null when no DB rows match (caller should keep default).
 */
export function majorityPoolKeyFromPlayers(
  rows: ReadonlyArray<{ poolKey: string }>
): string | null {
  if (rows.length === 0) return null;
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row.poolKey?.trim();
    if (!key || !isKnownPoolKey(key)) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [key, n] of counts) {
    if (n > bestN) {
      best = key;
      bestN = n;
    }
  }
  return best;
}

/**
 * Resolve which pool a saved sestava belongs to.
 *
 * - Any explicit known pool (repre_u20/u18/zeny, elh:*, …) is trusted as saved — never
 *   remapped to A-tým based on cand_* or similar heuristics.
 * - Only when stored is missing / default repre_a may we adopt an inferred pool
 *   (recovers lineups wrongly forced onto A-tým).
 */
export function resolveMatchSharePoolKey(opts: {
  storedPoolKey: unknown;
  inferredFromPlayers?: string | null;
}): string {
  const key = normalizeMatchSharePoolKey(opts.storedPoolKey);
  if (key !== DEFAULT_LINEUP_POOL) return key;
  const inferred = opts.inferredFromPlayers?.trim();
  if (inferred && isKnownPoolKey(inferred)) return inferred;
  return DEFAULT_LINEUP_POOL;
}

/** Editor URL with optional pool + saved code. */
export function matchLineupEditorHref(opts?: { poolKey?: string | null; code?: string | null }): string {
  const params = new URLSearchParams();
  const code = opts?.code?.trim();
  const pool = opts?.poolKey?.trim();
  if (code) params.set("kod", code);
  if (pool && isKnownPoolKey(pool)) params.set("pool", pool);
  const q = params.toString();
  return q ? `/zapasy/sestava?${q}` : "/zapasy/sestava";
}
