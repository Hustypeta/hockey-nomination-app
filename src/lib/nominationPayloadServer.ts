import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import {
  normalizeLineupStructure,
  isLineupComplete,
} from "@/lib/lineupUtils";
import { normalizeNominationTitle } from "@/lib/nominationTitle";
import type { LineupStructure } from "@/types";

export type ValidNominationPayload = {
  selectedPlayerIds: string[];
  captainId: string | null;
  lineupStructure: unknown;
  title: string;
};

/** Společná kontrola těla POST pro koncept i odeslání do soutěže. */
export function validateNominationPayload(body: unknown):
  | { ok: true; payload: ValidNominationPayload }
  | { ok: false; error: string; status: number } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Neplatný požadavek.", status: 400 };
  }
  const b = body as Record<string, unknown>;
  const { selectedPlayerIds } = b;
  const rawCaptain = b.captainId;
  const captainId =
    typeof rawCaptain === "string" && rawCaptain.trim() ? rawCaptain.trim() : null;
  const title = "title" in b ? normalizeNominationTitle(b.title) : null;

  if (!selectedPlayerIds || !Array.isArray(selectedPlayerIds)) {
    return { ok: false, error: "selectedPlayerIds is required", status: 400 };
  }

  if (!b.lineupStructure || typeof b.lineupStructure !== "object") {
    return { ok: false, error: "Chybí platná struktura sestavy (lineupStructure).", status: 400 };
  }

  const lineupStructureNorm = normalizeLineupStructure(b.lineupStructure as LineupStructure);
  if (!isLineupComplete(lineupStructureNorm)) {
    return {
      ok: false,
      error: "Sestava musí být kompletní — všech 25 hráčů na správných pozicích.",
      status: 400,
    };
  }

  if (!title) {
    return { ok: false, error: "Vyplň název nominace.", status: 400 };
  }

  const all = loadMs2026Candidates();
  const byId = new Map(all.map((p) => [p.id, p]));
  const players = selectedPlayerIds
    .map((id: string) => byId.get(id))
    .filter(Boolean) as typeof all;

  if (players.length !== selectedPlayerIds.length) {
    return { ok: false, error: "Neplatní hráči v nominaci", status: 400 };
  }

  const counts = { G: 0, D: 0, F: 0 };
  for (const p of players) {
    if (p.position in counts) counts[p.position as keyof typeof counts]++;
  }
  if (counts.G !== 3 || counts.D !== 8 || counts.F !== 14) {
    return {
      ok: false,
      error: `Neplatná sestava. Potřebujete: 3 brankáři, 8 obránců, 14 útočníků (25 hráčů). Máte: ${counts.G}G, ${counts.D}D, ${counts.F}F`,
      status: 400,
    };
  }

  return {
    ok: true,
    payload: {
      selectedPlayerIds: selectedPlayerIds as string[],
      captainId,
      lineupStructure: lineupStructureNorm,
      title,
    },
  };
}
