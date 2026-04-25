"use client";

import type { Player } from "@/types";

let ambiguousLastNames: ReadonlySet<string> | null = null;

function normalizeKey(s: string) {
  return s.trim().toLowerCase();
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

export function initJerseyNameDisambiguation(players: Player[]) {
  const counts = new Map<string, number>();
  for (const p of players) {
    const ln = extractLastName(p.name);
    const k = normalizeKey(ln);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const amb = new Set<string>();
  for (const [k, n] of counts.entries()) {
    if (n > 1) amb.add(k);
  }
  ambiguousLastNames = amb;
}

/**
 * Jméno na dresu: standardně příjmení, ale u jmenovců „I. Příjmení“.
 * Pokud ještě není inicializováno (např. před načtením `/api/players`), vrátí jen příjmení.
 */
export function jerseyNameOnJersey(fullName: string): string {
  const ln = extractLastName(fullName);
  const amb = ambiguousLastNames;
  if (!amb) return ln;
  if (!amb.has(normalizeKey(ln))) return ln;
  const initial = extractFirstNameInitial(fullName);
  return initial ? `${initial}. ${ln}` : ln;
}

