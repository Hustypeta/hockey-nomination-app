import type { Player } from "@/types";

let ambiguousLastNames: ReadonlySet<string> | null = null;

function normalizeKey(s: string) {
  return s.trim().toLowerCase();
}

/**
 * Klíč pro detekci stejného příjmení napříč zápisy (diakritika, „č“ vs ASCII atd.).
 * Používá se jen interně pro počítání duplicit, ne jako zobrazený text na dresu.
 */
export function lastNameKeyForAmbiguity(lastName: string): string {
  return normalizeKey(lastName)
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "");
}

function extractFirstNameInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const ch = first[0] ?? "";
  return ch ? ch.toUpperCase() : "";
}

function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? fullName.trim();
}

/** Množina klíčů příjmení, která se v zadaných jménech vyskytuje více než jednou. */
export function getAmbiguousLastNameKeysFromNames(names: Iterable<string>): ReadonlySet<string> {
  const counts = new Map<string, number>();
  for (const name of names) {
    const ln = extractLastName(name);
    const k = lastNameKeyForAmbiguity(ln);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const amb = new Set<string>();
  for (const [k, n] of counts.entries()) {
    if (n > 1) amb.add(k);
  }
  return amb;
}

/** Množina klíčů příjmení, která se na soupisce vyskytuje více než jednou. */
export function getAmbiguousLastNameKeys(players: Player[]): ReadonlySet<string> {
  return getAmbiguousLastNameKeysFromNames(players.map((p) => p.name));
}

export function initJerseyNameDisambiguation(players: Player[]) {
  ambiguousLastNames = getAmbiguousLastNameKeys(players);
}

/**
 * Jméno na dresu: standardně příjmení, u jmenovců „I. Příjmení“.
 * Druhý argument `ambiguousKeys` (z `getAmbiguousLastNameKeys(players)`) zajistí správné jméno
 * už při prvním vykreslení; bez něj se použije poslední stav po `initJerseyNameDisambiguation`.
 */
export function jerseyNameOnJersey(fullName: string, ambiguousKeys?: ReadonlySet<string> | null): string {
  const ln = extractLastName(fullName);
  const key = lastNameKeyForAmbiguity(ln);
  const amb = ambiguousKeys === undefined ? ambiguousLastNames : ambiguousKeys;
  if (!amb || amb.size === 0) return ln;
  if (!amb.has(key)) return ln;
  const initial = extractFirstNameInitial(fullName);
  return initial ? `${initial}. ${ln}` : ln;
}

/**
 * Jméno na dresu / v poolu / na plakátu.
 * `player.jerseyLast` je spočítané na serveru z celé soutěže (ELH napříč kluby),
 * takže jmenovci jako T. Tomek zůstanou i v klubovém editoru.
 */
export function jerseyNameForPlayer(
  player: Player,
  ambiguousKeys?: ReadonlySet<string> | null
): string {
  if (player.jerseyLast?.trim()) return player.jerseyLast.trim();
  return jerseyNameOnJersey(player.name, ambiguousKeys);
}

/** Připojí `jerseyLast` podle duplicit příjmení v `ambiguousKeys` (nebo v samotném seznamu). */
export function withJerseyLastNames(
  players: Player[],
  ambiguousKeys?: ReadonlySet<string> | null
): Player[] {
  const keys = ambiguousKeys ?? getAmbiguousLastNameKeys(players);
  return players.map((p) => ({
    ...p,
    jerseyLast: jerseyNameOnJersey(p.name, keys),
  }));
}
