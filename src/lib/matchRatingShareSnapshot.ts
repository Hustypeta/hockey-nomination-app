/**
 * Snapshot odkazu `/h/{slug}` — verze pole `ratings` (komunita) × `myRatings` (jeden hodnotitel).
 */

export type ShareMatchMeta = {
  slug: string;
  title: string;
  opponent: string | null;
  startsAt: string | null;
  venue: string | null;
  category: string;
  homeCode: string | null;
  awayCode: string | null;
};

/** Agregované průměry z DB (`groupBy`) — všichni hlasující. */
export type MatchRatingShareCommunitySnapshot = {
  snapshotVersion?: 2;
  kind?: "community";
  match: ShareMatchMeta;
  ratings: Record<string, { avg: number; count: number }>;
  createdAt: string;
};

/** Jen známky autora odkazu (`raterKey = u:{userId}`). */
export type MatchRatingSharePersonalSnapshot = {
  snapshotVersion: 2;
  kind: "personal";
  match: ShareMatchMeta;
  myRatings: Record<string, number>;
  createdAt: string;
};

export type MatchRatingShareSnapshot =
  | MatchRatingShareCommunitySnapshot
  | MatchRatingSharePersonalSnapshot;

export function isPersonalShareSnapshot(raw: MatchRatingShareSnapshot): raw is MatchRatingSharePersonalSnapshot {
  return raw.kind === "personal" && !!raw.myRatings && typeof raw.myRatings === "object";
}
