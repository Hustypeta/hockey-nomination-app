import { EMPTY_LINEUP, type LineupStructure, type Player } from "@/types";
import { historicalPlayerId } from "@/lib/historical-lineup/ids";
import {
  HISTORICAL_LINEUP_SLOTS,
  type HistoricalLineupGuess,
  type HistoricalLineupPuzzle,
  type HistoricalLineupSlot,
} from "@/lib/historical-lineup/types";
import { assignPlayerToTarget } from "@/lib/lineupAssign";
import type { DropTarget } from "@/lib/lineupAssign";

export const STARTING_SIX_DND: Record<HistoricalLineupSlot, string> = {
  LW: "slot-fwd-0-lw",
  C: "slot-fwd-0-c",
  RW: "slot-fwd-0-rw",
  LB: "slot-def-0-lb",
  RB: "slot-def-0-rb",
  G: "slot-goalie-0",
};

const AUTO_TARGETS: DropTarget[] = [
  { type: "forward", lineIndex: 0, role: "lw" },
  { type: "forward", lineIndex: 0, role: "c" },
  { type: "forward", lineIndex: 0, role: "rw" },
  { type: "defense", pairIndex: 0, role: "lb" },
  { type: "defense", pairIndex: 0, role: "rb" },
  { type: "goalie", index: 0 },
];

export function emptyStartingSixLineup(): LineupStructure {
  return structuredClone(EMPTY_LINEUP);
}

export function guessFromLineup(lineup: LineupStructure): HistoricalLineupGuess {
  return {
    LW: lineup.forwardLines[0]?.lw ?? null,
    C: lineup.forwardLines[0]?.c ?? null,
    RW: lineup.forwardLines[0]?.rw ?? null,
    LB: lineup.defensePairs[0]?.lb ?? null,
    RB: lineup.defensePairs[0]?.rb ?? null,
    G: lineup.goalies[0] ?? null,
  };
}

export function isStartingSixComplete(lineup: LineupStructure): boolean {
  const guess = guessFromLineup(lineup);
  return HISTORICAL_LINEUP_SLOTS.every((slot) => Boolean(guess[slot]));
}

export function answerIdsFromPuzzle(
  puzzle: HistoricalLineupPuzzle
): Record<HistoricalLineupSlot, string> {
  const out = {} as Record<HistoricalLineupSlot, string>;
  for (const row of puzzle.players) {
    if (!row.isAnswer || !row.slot) continue;
    out[row.slot] = historicalPlayerId(puzzle.id, row.name);
  }
  return out;
}

export function playersFromPuzzle(puzzle: HistoricalLineupPuzzle): Player[] {
  return puzzle.players.map((row) => ({
    id: historicalPlayerId(puzzle.id, row.name),
    name: row.name,
    position: row.position,
    role: row.role,
    club: row.club?.trim() || "",
    league: "Reprezentace",
    jerseyNumber: row.jersey,
    pick_rate: 0,
    poolKey: "repre_a",
  }));
}

export function tryAutoAssignStartingSix(
  lineup: LineupStructure,
  player: Player
): LineupStructure | null {
  const used = new Set(Object.values(guessFromLineup(lineup)).filter(Boolean));
  if (used.has(player.id)) return null;

  for (const target of AUTO_TARGETS) {
    const occupied =
      target.type === "forward"
        ? lineup.forwardLines[0]?.[target.role]
        : target.type === "defense"
          ? lineup.defensePairs[0]?.[target.role]
          : lineup.goalies[0];
    if (occupied) continue;
    const next = assignPlayerToTarget(lineup, player, target, { mode: "match" });
    if (next) return next;
  }
  return null;
}
