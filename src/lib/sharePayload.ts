import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

export const SHARE_PAYLOAD_VERSION = 1 as const;

export type SharePayload = {
  v: typeof SHARE_PAYLOAD_VERSION;
  captainId: string | null;
  lineupStructure: LineupStructure;
};

export function encodeSharePayload(payload: SharePayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeSharePayload(z: string): SharePayload | null {
  try {
    const json = decompressFromEncodedURIComponent(z);
    if (!json) return null;
    const data = JSON.parse(json) as SharePayload;
    if (data.v !== SHARE_PAYLOAD_VERSION || !data.lineupStructure) return null;
    return {
      ...data,
      lineupStructure: normalizeLineupStructure(data.lineupStructure),
    } as SharePayload;
  } catch {
    return null;
  }
}
