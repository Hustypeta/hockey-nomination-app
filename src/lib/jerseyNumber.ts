import type { Player } from "@/types";

/**
 * Čísla dresů v datech nejsou globálně unikátní — dva hráči mohou mít stejné číslo (např. repre vs. klub).
 * Rozlišení je vždy přes `player.id` / jméno.
 */

/** Jen pro případné jiné použití (testy, starý kód). Dres v sestavě číslo bez repre neukazuje. */
export function pseudoJerseyNumberFromId(playerId: string): string {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) h = (h * 31 + playerId.charCodeAt(i)) >>> 0;
  return String((h % 98) + 1);
}

export function parseStoredJerseyNumber(value: unknown): number | null {
  if (value == null) return null;
  const v = typeof value === "string" ? parseInt(value.trim(), 10) : Number(value);
  if (!Number.isFinite(v)) return null;
  const i = Math.floor(v);
  if (i < 1 || i > 999) return null;
  return i;
}

/** Číslo na dresu pouze pokud je v datech (repre); jinak prázdný řetězec. */
export function jerseyNumberForPlayer(player: Player): string {
  const n = parseStoredJerseyNumber(player.jerseyNumber);
  return n != null ? String(n) : "";
}
