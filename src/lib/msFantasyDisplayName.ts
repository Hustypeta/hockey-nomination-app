/** Zobrazení na fantasy kartě na ledu — příjmení (poslední token), bez licenčních fotek jde o čistší kartu. */
export function msFantasyLineupCardLastName(fullName: string): string {
  const t = fullName.trim();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  return parts.length ? (parts[parts.length - 1] ?? t) : t;
}
