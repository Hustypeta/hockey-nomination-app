import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { BracketMatchPick, BracketPickemPayload } from "@/types/bracketPickem";

export const BRACKET_PAYLOAD_VERSION = 1 as const;

function isMatchPick(x: unknown): x is BracketMatchPick {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    (o.teamLeft === null || typeof o.teamLeft === "string") &&
    (o.teamRight === null || typeof o.teamRight === "string") &&
    (o.winner === null || typeof o.winner === "string")
  );
}

function normalizeMatch(m: BracketMatchPick): BracketMatchPick {
  const { teamLeft, teamRight, winner } = m;
  const w =
    winner && (winner === teamLeft || winner === teamRight) ? winner : null;
  return { teamLeft, teamRight, winner: w };
}

export function encodeBracketPayload(payload: BracketPickemPayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeBracketPayload(z: string): BracketPickemPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(z);
    if (!json) return null;
    const data = JSON.parse(json) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (o.v !== BRACKET_PAYLOAD_VERSION) return null;

    const qf = o.quarterfinals;
    const sf = o.semifinals;
    if (!Array.isArray(qf) || qf.length !== 4 || !Array.isArray(sf) || sf.length !== 2) return null;
    if (!isMatchPick(o.final) || !isMatchPick(o.bronze)) return null;
    if (!qf.every(isMatchPick) || !sf.every(isMatchPick)) return null;

    const bonus = o.bonus;
    if (!bonus || typeof bonus !== "object") return null;
    const b = bonus as Record<string, unknown>;
    const str = (k: string) => (typeof b[k] === "string" ? b[k] : "");

    const payload: BracketPickemPayload = {
      v: BRACKET_PAYLOAD_VERSION,
      groupAWinner: typeof o.groupAWinner === "string" ? o.groupAWinner : null,
      groupBWinner: typeof o.groupBWinner === "string" ? o.groupBWinner : null,
      quarterfinals: (qf as BracketMatchPick[]).map(normalizeMatch),
      semifinals: (sf as BracketMatchPick[]).map(normalizeMatch),
      final: normalizeMatch(o.final as BracketMatchPick),
      bronze: normalizeMatch(o.bronze as BracketMatchPick),
      bonus: {
        mvp: str("mvp"),
        topCzechScorer: str("topCzechScorer"),
        pointsLeader: str("pointsLeader"),
        czechQuarterFinals: str("czechQuarterFinals"),
        finalTotalGoals: str("finalTotalGoals"),
      },
    };
    return payload;
  } catch {
    return null;
  }
}
