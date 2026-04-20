import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

export const SHARE_PAYLOAD_VERSION = 1 as const;

export type SharePayload = {
  v: typeof SHARE_PAYLOAD_VERSION;
  captainId: string | null;
  lineupStructure: LineupStructure;
};

/** Kratší JSON před LZ (méně znaků v URL než plné `lineupStructure`). */
type CompactWire = {
  v: typeof SHARE_PAYLOAD_VERSION;
  /** captainId */
  c: string | null;
  fl: [string | null, string | null, string | null, string | null][];
  dp: [string | null, string | null][];
  g: [string | null, string | null, string | null];
  xf: string | null;
  xd: string[];
  ai?: string[];
};

function compactToLineup(w: CompactWire): LineupStructure {
  return normalizeLineupStructure({
    forwardLines: w.fl as unknown as LineupStructure["forwardLines"],
    defensePairs: w.dp as unknown as LineupStructure["defensePairs"],
    goalies: w.g,
    extraForwards: [w.xf],
    extraDefensemen: [...w.xd],
    assistantIds: w.ai ?? [],
  });
}

function lineupToCompact(ls: LineupStructure): CompactWire {
  return {
    v: SHARE_PAYLOAD_VERSION,
    c: null,
    fl: ls.forwardLines.map((l) => [l.lw, l.c, l.rw, l.x]),
    dp: ls.defensePairs.map((p) => [p.lb, p.rb]),
    g: ls.goalies,
    xf: ls.extraForwards[0],
    xd: [...ls.extraDefensemen],
    ai: ls.assistantIds?.length ? ls.assistantIds : undefined,
  };
}

export function encodeSharePayload(payload: SharePayload): string {
  const wire: CompactWire = {
    ...lineupToCompact(payload.lineupStructure),
    c: payload.captainId,
  };
  return compressToEncodedURIComponent(JSON.stringify(wire));
}

export function decodeSharePayload(z: string): SharePayload | null {
  try {
    const json = decompressFromEncodedURIComponent(z);
    if (!json) return null;
    const data = JSON.parse(json) as SharePayload | CompactWire | Record<string, unknown>;
    if ((data as { v?: unknown }).v !== SHARE_PAYLOAD_VERSION) return null;

    if ("lineupStructure" in data && data.lineupStructure) {
      const legacy = data as SharePayload;
      return {
        ...legacy,
        lineupStructure: normalizeLineupStructure(legacy.lineupStructure),
      };
    }

    const w = data as CompactWire;
    if (!Array.isArray(w.fl) || !Array.isArray(w.dp) || !Array.isArray(w.g)) return null;
    return {
      v: SHARE_PAYLOAD_VERSION,
      captainId: w.c,
      lineupStructure: compactToLineup(w),
    };
  } catch {
    return null;
  }
}
