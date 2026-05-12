/**
 * Konečné výsledky zápasů Česka na Beijir Hockey Games (zobrazení u vlajek).
 * Klíč je `slug` zápasu; čísla odpovídají pořadí homeCode / awayCode v DB (vlajka vlevo = domácí).
 */
export type BeijirMatchResult = {
  /** Např. „CZE:SWE 3:1“ — stejný formát jako v briefu. */
  headline: string;
  homeGoals: number;
  awayGoals: number;
};

export const BEIJIR_MATCH_RESULTS: Record<string, BeijirMatchResult> = {
  "beijir-cze-swe-2026-05-07-1700": {
    headline: "CZE:SWE 3:1",
    homeGoals: 3,
    awayGoals: 1,
  },
  "beijir-fin-cze-2026-05-09-1200": {
    headline: "CZE:FIN 2:3",
    homeGoals: 3,
    awayGoals: 2,
  },
  "beijir-sui-cze-2026-05-10-1200": {
    headline: "CZE:SWI 1:6",
    homeGoals: 6,
    awayGoals: 1,
  },
};

/**
 * Výsledek podle slug (náhled bez DB) nebo podle páru domácí/hostující u zápasů kategorie `beijir`
 * (admin seed často vytvoří slug `cze-swe` místo dlouhého náhledového slug).
 */
export function resolveBeijirMatchResult(opts: {
  slug: string;
  category?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
}): BeijirMatchResult | undefined {
  const direct = BEIJIR_MATCH_RESULTS[opts.slug];
  if (direct) return direct;

  if (opts.category !== "beijir") return undefined;

  const h = (opts.homeCode ?? "").trim().toUpperCase();
  const a = (opts.awayCode ?? "").trim().toUpperCase();

  if (h === "CZE" && a === "SWE") return BEIJIR_MATCH_RESULTS["beijir-cze-swe-2026-05-07-1700"];
  if (h === "FIN" && a === "CZE") return BEIJIR_MATCH_RESULTS["beijir-fin-cze-2026-05-09-1200"];
  if (h === "SUI" && a === "CZE") return BEIJIR_MATCH_RESULTS["beijir-sui-cze-2026-05-10-1200"];

  return undefined;
}
