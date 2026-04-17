import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import type { Player } from "@/types";
import { leagueForClub } from "./clubLeague";
import { parseStoredJerseyNumber } from "./jerseyNumber";

type JsonRow = {
  name: string;
  position: string;
  role: string;
  club: string;
  /** Repre / klub; u různých hráčů se čísla mohou opakovat. */
  jerseyNumber?: number | string;
};

/** Stabilní ID napříč seedem / API / uloženými nominacemi (bez náhodného cuid). */
export function stableCandidatePlayerId(
  name: string,
  club: string,
  roleKey: string
): string {
  const h = createHash("sha256")
    .update(`${name.trim()}|${club.trim()}|${roleKey.trim()}`)
    .digest("hex");
  return `cand_${h.slice(0, 24)}`;
}

function rowToPlayer(p: JsonRow): Player {
  const pos = p.position as Player["position"];
  const roleNorm =
    p.role?.trim() || (pos === "G" ? "G" : null);
  const idKey = p.role?.trim() || p.position;
  const jerseyNumber = parseStoredJerseyNumber(p.jerseyNumber);
  return {
    id: stableCandidatePlayerId(p.name, p.club, idKey),
    name: p.name.trim(),
    position: pos,
    role: pos === "G" ? "G" : roleNorm,
    club: p.club.trim(),
    league: leagueForClub(p.club),
    ...(jerseyNumber != null ? { jerseyNumber } : {}),
  };
}

let cache: Player[] | null = null;

/** Načte `czech-ms-2026-candidates-80.json` z kořene projektu (server-only). */
export function loadMs2026Candidates(): Player[] {
  if (cache) return cache;
  const path = join(process.cwd(), "czech-ms-2026-candidates-80.json");
  const raw = JSON.parse(readFileSync(path, "utf-8")) as JsonRow[];
  cache = raw.map(rowToPlayer);
  return cache;
}

