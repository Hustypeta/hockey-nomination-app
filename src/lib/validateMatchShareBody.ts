import { normalizeMatchSharePoolKey } from "@/lib/matchSharePool";
import type { LineupStructure } from "@/types";

export type MatchShareBody = {
  title: string;
  captainId: string | null;
  lineupStructure: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  poolKey: string;
};

export function validateMatchShareBody(body: unknown):
  | ({ ok: true } & MatchShareBody)
  | { ok: false; status: number; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Neplatný požadavek." };
  }
  const x = body as Record<string, unknown>;
  const title = typeof x.title === "string" ? x.title.trim() : "";
  if (!title) return { ok: false, status: 400, error: "Chybí název." };
  const captainId = typeof x.captainId === "string" ? x.captainId : null;
  const lineupStructure = x.lineupStructure;
  if (!lineupStructure || typeof lineupStructure !== "object") {
    return { ok: false, status: 400, error: "Chybí sestava." };
  }
  const defenseCountRaw = x.defenseCount;
  const defenseCount =
    defenseCountRaw === 6 || defenseCountRaw === 7 || defenseCountRaw === 8 ? defenseCountRaw : 8;
  const allowExtraForward = Boolean(x.allowExtraForward);
  const poolKey = normalizeMatchSharePoolKey(x.poolKey);
  return {
    ok: true,
    title,
    captainId,
    lineupStructure: lineupStructure as LineupStructure,
    defenseCount,
    allowExtraForward,
    poolKey,
  };
}

