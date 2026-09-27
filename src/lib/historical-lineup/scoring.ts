import {
  HISTORICAL_LINEUP_SLOTS,
  type HistoricalLineupGuess,
  type HistoricalLineupScore,
  type HistoricalLineupSlot,
  type HistoricalLineupSlotResult,
} from "@/lib/historical-lineup/types";

export function scoreStartingSix(
  guess: HistoricalLineupGuess,
  answer: Record<HistoricalLineupSlot, string>
): HistoricalLineupScore {
  const bySlot = {} as Record<HistoricalLineupSlot, HistoricalLineupSlotResult>;
  let points = 0;
  for (const slot of HISTORICAL_LINEUP_SLOTS) {
    const ok = guess[slot] != null && guess[slot] === answer[slot];
    bySlot[slot] = ok ? "correct" : "wrong";
    if (ok) points += 1;
  }
  return { points, max: HISTORICAL_LINEUP_SLOTS.length, bySlot };
}
