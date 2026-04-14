import { normalizeLineupStructure } from "@/lib/lineupUtils";
import type { LineupStructure } from "@/types";

/** Stejné pořadí slotů jako při skládání `selectedPlayerIds` v klientovi — musí sedět s oficiální sestavou. */
export function iterLineupSlots(lineup: LineupStructure): { key: string; playerId: string }[] {
  const out: { key: string; playerId: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const l = lineup.forwardLines[i];
    if (l.lw) out.push({ key: `f${i}-lw`, playerId: l.lw });
    if (l.c) out.push({ key: `f${i}-c`, playerId: l.c });
    if (l.rw) out.push({ key: `f${i}-rw`, playerId: l.rw });
    if (l.x) out.push({ key: `f${i}-x`, playerId: l.x });
  }
  for (let i = 0; i < 4; i++) {
    const p = lineup.defensePairs[i];
    if (p.lb) out.push({ key: `d${i}-lb`, playerId: p.lb });
    if (p.rb) out.push({ key: `d${i}-rb`, playerId: p.rb });
  }
  lineup.goalies.forEach((g, i) => {
    if (g) out.push({ key: `g${i}`, playerId: g });
  });
  if (lineup.extraForwards[0]) {
    out.push({ key: "xf0", playerId: lineup.extraForwards[0] });
  }
  lineup.extraDefensemen.forEach((id, i) => {
    if (id) out.push({ key: `xd${i}`, playerId: id });
  });
  return out;
}

export function slotCategory(key: string): "G" | "D" | "F" {
  if (key.startsWith("g")) return "G";
  if (key.startsWith("d") || key.startsWith("xd")) return "D";
  return "F";
}

function officialPlayerToSlot(official: LineupStructure): Map<string, string> {
  const m = new Map<string, string>();
  for (const { key, playerId } of iterLineupSlots(official)) {
    m.set(playerId, key);
  }
  return m;
}

export type ContestScoreBreakdown = {
  totalPoints: number;
  basePlayerPoints: number;
  playerPointsAfterTimeBonus: number;
  captainBonus: number;
  assistantBonus: number;
  timeBonusPercent: number;
};

/**
 * Bodování dle pravidel soutěže: 5 přesný slot, 2 shoda v G/D/F, kapitán +10, asistent +4 (max 2),
 * časový bonus jen na body za hráče (ne na kapitána/asistenty).
 */
export function scoreNominationAgainstOfficial(
  userLineup: LineupStructure,
  officialLineup: LineupStructure,
  userCaptainId: string | null | undefined,
  officialCaptainId: string | null | undefined,
  timeBonusPercent: number
): ContestScoreBreakdown {
  const user = normalizeLineupStructure(userLineup);
  const off = normalizeLineupStructure(officialLineup);
  const officialByPlayer = officialPlayerToSlot(off);

  let basePlayerPoints = 0;
  for (const { key, playerId } of iterLineupSlots(user)) {
    const officialKey = officialByPlayer.get(playerId);
    if (officialKey === undefined) continue;
    if (officialKey === key) basePlayerPoints += 5;
    else if (slotCategory(key) === slotCategory(officialKey)) basePlayerPoints += 2;
  }

  const captainBonus =
    userCaptainId && officialCaptainId && userCaptainId === officialCaptainId ? 10 : 0;

  const offAsst = new Set((off.assistantIds ?? []).filter(Boolean));
  const userAsstUnique = [...new Set((user.assistantIds ?? []).filter(Boolean))];
  let assistantMatches = 0;
  for (const id of userAsstUnique) {
    if (offAsst.has(id)) assistantMatches++;
  }
  assistantMatches = Math.min(assistantMatches, 2);
  const assistantBonus = assistantMatches * 4;

  const pct = Math.max(0, timeBonusPercent);
  const playerPointsAfterTimeBonus = Math.round((basePlayerPoints * (100 + pct)) / 100);
  const totalPoints = playerPointsAfterTimeBonus + captainBonus + assistantBonus;

  return {
    totalPoints,
    basePlayerPoints,
    playerPointsAfterTimeBonus,
    captainBonus,
    assistantBonus,
    timeBonusPercent: pct,
  };
}
