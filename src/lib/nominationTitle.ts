const MAX_LEN = 80;

/** Vrátí ořezaný název nebo `null` pro prázdný vstup. */
export function normalizeNominationTitle(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return null;
  return t.length > MAX_LEN ? t.slice(0, MAX_LEN) : t;
}
