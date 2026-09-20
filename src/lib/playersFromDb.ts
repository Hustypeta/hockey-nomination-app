import { prisma } from "@/lib/prisma";
import { leagueForClub } from "@/lib/clubLeague";
import { DEFAULT_LINEUP_POOL, isElhPoolKey, isKnownPoolKey } from "@/lib/lineupPools";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import {
  getAmbiguousLastNameKeysFromNames,
  withJerseyLastNames,
} from "@/lib/jerseyDisplayName";
import type { Player } from "@/types";

function dbRowToPlayer(row: {
  id: string;
  name: string;
  position: string;
  role: string | null;
  club: string;
  league: string | null;
  jerseyNumber: number | null;
  poolKey: string;
}): Player {
  const position = row.position as Player["position"];
  return {
    id: row.id,
    name: row.name,
    position,
    role: position === "G" ? "G" : row.role,
    club: row.club,
    league: row.league?.trim() || leagueForClub(row.club),
    pick_rate: 0,
    ...(row.jerseyNumber != null ? { jerseyNumber: row.jerseyNumber } : {}),
    poolKey: row.poolKey,
  };
}

function isMissingPoolKeyColumn(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { code?: string; message?: string; meta?: { column?: string } };
  if (err.code !== "P2022") return false;
  const msg = String(err.message ?? "");
  const col = String(err.meta?.column ?? "");
  // Only treat as missing poolKey when the error names that column — never map every P2022.
  return /players\.poolKey/i.test(msg) || /(?:^|[.\s"])poolKey(?:$|[.\s"])/i.test(col + " " + msg);
}

export type PlayersLoadIssue =
  | "schema_missing_poolKey"
  | "db_error"
  | "all_in_repre_a"
  | null;

export type PlayersLoadResult = {
  players: Player[];
  /** null = loaded fine (DB or intentional empty / A-team empty-DB JSON fallback). */
  issue: PlayersLoadIssue;
  source: "db" | "fallback" | "empty";
};

/**
 * Příjmení s více hráči ve stejné soutěži: celá ELH u klubového poolu, jinak jen daný pool.
 * Díky tomu má Tomáš Tomek v Kladně „T. Tomek“, i když je v klubu sám.
 */
async function loadAmbiguousLastNameKeysForPool(poolKey: string): Promise<ReadonlySet<string>> {
  const where = isElhPoolKey(poolKey)
    ? { poolKey: { startsWith: "elh:" } }
    : { poolKey };
  const rows = await prisma.player.findMany({
    where,
    select: { name: true },
  });
  return getAmbiguousLastNameKeysFromNames(rows.map((r) => r.name));
}

async function withScopeJerseyLastNames(poolKey: string, players: Player[]): Promise<Player[]> {
  if (players.length === 0) return players;
  try {
    const keys = await loadAmbiguousLastNameKeysForPool(poolKey);
    return withJerseyLastNames(players, keys);
  } catch {
    return withJerseyLastNames(players);
  }
}

/** Hráči pro editor sestavy — primárně z DB podle poolKey. */
export async function loadPlayersForPool(poolKey: string): Promise<Player[]> {
  const { players } = await loadPlayersForPoolDetailed(poolKey);
  return players;
}

/**
 * Load players for a pool.
 * Schema / DB failures never silently succeed for A-tým only — both ELH and A-tým
 * surface `issue` so `/api/players` can return 503 with fix commands.
 * JSON fallback for A-tým only when the DB query succeeds but the pool is empty
 * (first boot before import).
 */
export async function loadPlayersForPoolDetailed(poolKey: string): Promise<PlayersLoadResult> {
  const key = (poolKey || DEFAULT_LINEUP_POOL).trim();
  if (!isKnownPoolKey(key) && !key.startsWith("elh:")) {
    return { players: [], issue: null, source: "empty" };
  }

  try {
    const rows = await prisma.player.findMany({
      where: { poolKey: key },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
    if (rows.length > 0) {
      const players = await withScopeJerseyLastNames(key, rows.map(dbRowToPlayer));
      return { players, issue: null, source: "db" };
    }

    // Empty requested pool — detect classic "everything dumped into repre_a"
    if (key !== DEFAULT_LINEUP_POOL) {
      try {
        const groups = await prisma.player.groupBy({
          by: ["poolKey"],
          _count: { _all: true },
        });
        const total = groups.reduce((s, g) => s + g._count._all, 0);
        const repreA = groups.find((g) => g.poolKey === DEFAULT_LINEUP_POOL)?._count._all ?? 0;
        const elh = groups
          .filter((g) => g.poolKey.startsWith("elh:"))
          .reduce((s, g) => s + g._count._all, 0);
        if (total > 220 && elh === 0 && repreA === total) {
          return { players: [], issue: "all_in_repre_a", source: "empty" };
        }
      } catch {
        /* ignore secondary check */
      }
    }
  } catch (e) {
    console.error("loadPlayersForPool DB error:", e);
    if (isMissingPoolKeyColumn(e)) {
      // Do NOT mask with JSON fallback — A-tým and ELH both fail loudly.
      return { players: [], issue: "schema_missing_poolKey", source: "empty" };
    }
    return { players: [], issue: "db_error", source: "empty" };
  }

  // Fallback: A-tým z JSON jen když DB odpovídá, ale pool je prázdný (před prvním importem)
  if (key === DEFAULT_LINEUP_POOL) {
    const fallback = loadMs2026Candidates().map((p) => ({ ...p, poolKey: key }));
    return {
      players: withJerseyLastNames(fallback),
      issue: null,
      source: "fallback",
    };
  }
  return { players: [], issue: null, source: "empty" };
}

export async function listPoolCounts(): Promise<{ poolKey: string; count: number }[]> {
  try {
    const groups = await prisma.player.groupBy({
      by: ["poolKey"],
      _count: { _all: true },
      orderBy: { poolKey: "asc" },
    });
    return groups.map((g) => ({ poolKey: g.poolKey, count: g._count._all }));
  } catch (e) {
    if (isMissingPoolKeyColumn(e)) {
      console.error(
        "listPoolCounts: players.poolKey missing — run `npm run db:ensure` then `npm run import:lineup-pools`"
      );
      throw Object.assign(new Error("SCHEMA_MISSING_POOL_KEY"), { code: "SCHEMA_MISSING_POOL_KEY" });
    }
    throw e;
  }
}
