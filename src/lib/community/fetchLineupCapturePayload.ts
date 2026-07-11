import type { ForumCaptureLineupPayload } from "@/components/komunita/ForumLineupPosterCaptureStage";
import type { MyLineupPick } from "@/lib/community/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure, Player } from "@/types";

type NominationCaptureResponse = {
  captainId: string | null;
  title: string | null;
  createdAt: string;
  lineupStructure: LineupStructure | null;
  players?: Player[];
};

type MatchLineupCaptureResponse = {
  title: string | null;
  captainId: string | null;
  lineupStructure: LineupStructure;
  defenseCount: number;
  allowExtraForward: boolean;
};

export async function fetchLineupCapturePayload(
  pick: MyLineupPick,
  fallbackPlayers: Player[]
): Promise<ForumCaptureLineupPayload | null> {
  if (pick.kind === "NOMINATION") {
    const res = await fetch(`/api/nominations/${encodeURIComponent(pick.id)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as NominationCaptureResponse;
    if (!data.lineupStructure) return null;
    return {
      kind: "NOMINATION",
      players: data.players?.length ? data.players : fallbackPlayers,
      lineup: normalizeLineupStructure(data.lineupStructure),
      captainId: data.captainId,
      title: data.title ?? pick.title,
      createdAtIso: data.createdAt,
    };
  }

  if (pick.kind === "MATCH_LINEUP") {
    const res = await fetch(`/api/match-share-links/${encodeURIComponent(pick.id)}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MatchLineupCaptureResponse;
    const dc = data.defenseCount;
    const defenseCount = dc === 7 || dc === 8 ? dc : 6;
    return {
      kind: "MATCH_LINEUP",
      players: fallbackPlayers,
      lineup: normalizeLineupStructure(data.lineupStructure),
      captainId: data.captainId,
      title: data.title ?? pick.title,
      defenseCount,
      allowExtraForward: Boolean(data.allowExtraForward),
    };
  }

  return null;
}

export async function fetchNominationCapturePayloadById(
  nominationId: string,
  fallbackPlayers: Player[]
): Promise<ForumCaptureLineupPayload | null> {
  return fetchLineupCapturePayload(
    { kind: "NOMINATION", id: nominationId, title: "", createdAt: new Date().toISOString() },
    fallbackPlayers
  );
}
