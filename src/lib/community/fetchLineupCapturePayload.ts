import type { ForumCaptureLineupPayload } from "@/components/komunita/ForumLineupPosterCaptureStage";
import type { MyLineupPick } from "@/lib/community/types";
import { DEFAULT_LINEUP_POOL } from "@/lib/lineupPools";
import { collectLineupPlayerIds, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure, Player } from "@/types";

/**
 * Historická `cand_…` ID z doby před změnou klubu v kandidátech.
 * Oficiální soupiska i vítězná nominace je pořád mají; aktuální JSON už počítá nová ID.
 */
const LEGACY_NOMINATION_PLAYERS: Player[] = [
  {
    id: "cand_2d5a675753ac1446ab70f448",
    name: "Matěj Blümel",
    position: "F",
    role: "LW/RW",
    club: "HC Sparta Praha",
    league: "Extraliga",
    jerseyNumber: 28,
    pick_rate: 0,
    poolKey: DEFAULT_LINEUP_POOL,
  },
  {
    id: "cand_ddf6090b10b3b84d32a786b4",
    name: "David Tomášek",
    position: "F",
    role: "C",
    club: "HC Dynamo Pardubice",
    league: "Extraliga",
    jerseyNumber: 96,
    pick_rate: 0,
    poolKey: DEFAULT_LINEUP_POOL,
  },
  {
    id: "cand_4b9d42a09c541f8a56f9ae90",
    name: "Daniel Voženílek",
    position: "F",
    role: "LW/RW",
    club: "HC Oceláři Třinec",
    league: "Extraliga",
    jerseyNumber: 96,
    pick_rate: 0,
    poolKey: DEFAULT_LINEUP_POOL,
  },
  {
    id: "cand_0dfd7d9ef48b1e5bb4e683a7",
    name: "Michal Kempný",
    position: "D",
    role: "LB",
    club: "Rytíři Kladno",
    league: "Extraliga",
    jerseyNumber: 6,
    pick_rate: 0,
    poolKey: DEFAULT_LINEUP_POOL,
  },
  {
    id: "cand_8455c20116ff23d79957f851",
    name: "Dominik Pavlát",
    position: "G",
    role: "G",
    club: "Rytíři Kladno",
    league: "Extraliga",
    jerseyNumber: 39,
    pick_rate: 0,
    poolKey: DEFAULT_LINEUP_POOL,
  },
];

function playersForLineupIds(
  lineup: LineupStructure,
  ...lists: Array<Player[] | undefined>
): Player[] {
  const byId = new Map<string, Player>();
  for (const list of lists) {
    if (!list) continue;
    for (const player of list) byId.set(player.id, player);
  }
  return [...collectLineupPlayerIds(lineup)]
    .map((id) => byId.get(id))
    .filter((player): player is Player => player != null);
}

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
  poolKey?: string | null;
};

export async function fetchLineupCapturePayload(
  pick: MyLineupPick,
  fallbackPlayers: Player[],
  matchPosterVariant: "names" | "jerseys" = "jerseys",
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
      lineup: normalizeLineupStructure(data.lineupStructure, { mode: "match" }),
      captainId: data.captainId,
      title: data.title ?? pick.title,
      defenseCount,
      allowExtraForward: Boolean(data.allowExtraForward),
      poolKey: data.poolKey ?? null,
      posterVariant: matchPosterVariant,
    };
  }

  return null;
}

/**
 * Admin „Vítěz nominací“ — stejný 4:5 plakát Jména + dresy jako u zápasové sestavy.
 * 8. bek z náhradníka jde do 4. páru; 13. útočník (slot x) do extra slotu.
 * 3. gólman a 14. náhradní útočník na tomto plakátu nejsou (stejně jako u zápasu).
 * Titulek plakátu a jméno trenéra (Rulík) jsou jen pro tento capture
 * (původní název nominace a Moták na zápasovém / editorovém plakátu se nemění).
 */
function nominationToJerseyForumPayload(
  nom: Extract<ForumCaptureLineupPayload, { kind: "NOMINATION" }>,
  fallbackPlayers: Player[],
): ForumCaptureLineupPayload {
  const ls = normalizeLineupStructure(nom.lineup);
  const eighthD = ls.extraDefensemen[0] ?? null;
  const thirteenthF = ls.forwardLines[3].x ?? ls.extraForwards[0] ?? null;
  const l4 = ls.forwardLines[3];

  const lineup = normalizeLineupStructure(
    {
      ...ls,
      forwardLines: [
        ls.forwardLines[0],
        ls.forwardLines[1],
        ls.forwardLines[2],
        { lw: l4.lw, c: l4.c, rw: l4.rw, x: null },
      ],
      defensePairs: [
        ls.defensePairs[0],
        ls.defensePairs[1],
        ls.defensePairs[2],
        { lb: ls.defensePairs[3].lb, rb: eighthD },
      ],
      extraForwards: [thirteenthF],
      extraDefensemen: [],
    },
    { mode: "match" },
  );

  let dCount = 0;
  for (const pair of lineup.defensePairs) {
    if (pair.lb) dCount += 1;
    if (pair.rb) dCount += 1;
  }
  const defenseCount: 6 | 7 | 8 = dCount >= 8 ? 8 : dCount >= 7 ? 7 : 6;

  return {
    kind: "MATCH_LINEUP",
    players: playersForLineupIds(
      lineup,
      LEGACY_NOMINATION_PLAYERS,
      fallbackPlayers,
      nom.players,
    ),
    lineup,
    captainId: nom.captainId,
    title: "Vítězná nominace MS 2026",
    coachName: "Rulík",
    defenseCount,
    allowExtraForward: Boolean(thirteenthF),
    poolKey: DEFAULT_LINEUP_POOL,
    posterVariant: "jerseys",
  };
}

export async function fetchNominationCapturePayloadById(
  nominationId: string,
  fallbackPlayers: Player[]
): Promise<ForumCaptureLineupPayload | null> {
  const nom = await fetchLineupCapturePayload(
    { kind: "NOMINATION", id: nominationId, title: "", createdAt: new Date().toISOString() },
    fallbackPlayers,
  );
  if (!nom || nom.kind !== "NOMINATION") return null;
  return nominationToJerseyForumPayload(nom, fallbackPlayers);
}
