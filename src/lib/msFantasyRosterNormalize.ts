/** Excel / soupiska: O = obránce, Ú = útočník, B = brankář. V DB a logice fantasy zůstává G / D / F. */
export type MsFantasyCanonicalPosition = "G" | "D" | "F";

const POS_MAP: Record<string, MsFantasyCanonicalPosition> = {
  B: "G",
  b: "G",
  O: "D",
  o: "D",
  Ú: "F",
  ú: "F",
  U: "F",
  u: "F",
  G: "G",
  g: "G",
  D: "D",
  d: "D",
  F: "F",
  f: "F",
};

/**
 * Převod pozice z Excelu (O, Ú, B) nebo už kanonických G/D/F.
 * Vrací null, pokud řetězec nejde rozpoznat.
 */
export function normalizeMsFantasyPosition(raw: string): MsFantasyCanonicalPosition | null {
  const t = raw.trim();
  if (!t) return null;
  const mapped = POS_MAP[t];
  if (mapped) return mapped;
  const up = t.toUpperCase();
  if (up === "Ú" || up === "U") return "F";
  if (up === "O") return "D";
  if (up === "B") return "G";
  if (up === "G" || up === "D" || up === "F") return up as MsFantasyCanonicalPosition;
  return null;
}

/** Kategorie A–E z Excelu → tier v DB (velké písmeno). */
export function normalizeMsFantasyTier(raw: string): string | null {
  const x = raw.trim().toUpperCase();
  if (["A", "B", "C", "D", "E"].includes(x)) return x;
  return null;
}
