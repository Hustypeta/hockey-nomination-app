export type MatchRatingAggregateMap = Record<string, { avg: number; count: number } | undefined>;
export type MatchRatingMyMap = Record<string, number | undefined>;

export function fmtMatchRating(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "–";
  return n.toFixed(1).replace(".", ",");
}

/** Stejná logika jako u {@link MatchRatingPoster}: osobní režim jen moje; komunita primárně průměr, jinak moje. */
export function resolveMatchRatingDisplay(
  playerId: string,
  ratings: MatchRatingAggregateMap,
  myRatings: MatchRatingMyMap,
  mode: "personal" | "community"
): number | null {
  const aggregate = ratings[playerId];
  const mine = myRatings[playerId];
  if (mode === "personal") {
    return typeof mine === "number" && Number.isFinite(mine) ? mine : null;
  }
  if (aggregate && Number.isFinite(aggregate.avg) && aggregate.avg > 0) return aggregate.avg;
  if (typeof mine === "number" && Number.isFinite(mine)) return mine;
  return null;
}

export function matchRatingHue(n: number | null): { bg: string; ring: string; text: string } {
  if (n == null || n <= 0) {
    return {
      bg: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
      ring: "rgba(255,255,255,0.25)",
      text: "rgba(255,255,255,0.6)",
    };
  }
  if (n >= 8.5)
    return {
      bg: "linear-gradient(180deg, #34d399 0%, #047857 100%)",
      ring: "rgba(52, 211, 153, 0.55)",
      text: "white",
    };
  if (n >= 7)
    return {
      bg: "linear-gradient(180deg, #a3e635 0%, #4d7c0f 100%)",
      ring: "rgba(163, 230, 53, 0.55)",
      text: "#0b1a05",
    };
  if (n >= 5)
    return {
      bg: "linear-gradient(180deg, #fde68a 0%, #d97706 100%)",
      ring: "rgba(253, 230, 138, 0.55)",
      text: "#1a1208",
    };
  if (n >= 3.5)
    return {
      bg: "linear-gradient(180deg, #fb923c 0%, #b45309 100%)",
      ring: "rgba(251, 146, 60, 0.55)",
      text: "white",
    };
  return {
    bg: "linear-gradient(180deg, #f87171 0%, #991b1b 100%)",
    ring: "rgba(248, 113, 113, 0.55)",
    text: "white",
  };
}
