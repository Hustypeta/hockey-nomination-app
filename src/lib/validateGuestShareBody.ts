import { normalizeLineupStructure, isLineupComplete, isLeadershipComplete } from "@/lib/lineupUtils";
import { normalizeNominationTitle } from "@/lib/nominationTitle";
import type { LineupStructure } from "@/types";

export function validateGuestShareBody(body: unknown):
  | { ok: true; title: string; captainId: string; lineupStructure: LineupStructure }
  | { ok: false; error: string; status: number } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Neplatný požadavek.", status: 400 };
  }
  const b = body as Record<string, unknown>;
  const raw = b.lineupStructure;
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Chybí lineupStructure.", status: 400 };
  }
  const title = normalizeNominationTitle(b.title);
  if (!title) {
    return { ok: false, error: "Vyplň název nominace.", status: 400 };
  }
  const cap = typeof b.captainId === "string" && b.captainId.trim() ? b.captainId.trim() : null;
  if (!cap) {
    return { ok: false, error: "Vyber kapitána týmu v sestavě.", status: 400 };
  }
  const lineupStructure = normalizeLineupStructure(raw as LineupStructure);
  if (!isLineupComplete(lineupStructure)) {
    return { ok: false, error: "Sestava musí být kompletní (25 hráčů).", status: 400 };
  }
  if (!isLeadershipComplete(lineupStructure, cap)) {
    return {
      ok: false,
      error: "Zvol kapitána a přesně dva asistenty (A) v sestavě.",
      status: 400,
    };
  }
  return { ok: true, title, captainId: cap, lineupStructure };
}
