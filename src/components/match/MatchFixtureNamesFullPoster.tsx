"use client";

import { forwardRef, useMemo, useState, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { SHARE_POSTER_3X4_STYLE } from "@/lib/sharePosterLayout";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
} from "@/lib/matchLineupPosterSegments";
import { rosterLastDisplay } from "@/lib/namesOnlyRoster";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingAggregateMap,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import styles from "./MatchFixtureNamesFullPoster.module.css";

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className={styles.sectionLabelRow}>
      <span className={styles.sectionRule} aria-hidden />
      <h3 className={styles.sectionLabel}>{children}</h3>
      <span className={styles.sectionRule} aria-hidden />
    </div>
  );
}

function PlayerCard({ nameLine }: { nameLine: string }) {
  return (
    <div className={styles.playerCard}>
      <span className={`${styles.playerName} line-clamp-2 break-words`}>{nameLine}</span>
    </div>
  );
}

function voteLineCs(n: number): string {
  if (n === 1) return "1 hlas";
  if (n >= 2 && n <= 4) return `${n} hlasy`;
  return `${n} hlasů`;
}

function RatingNamePill({
  nameLine,
  display,
  snapshotMode,
  votes,
}: {
  nameLine: string;
  display: number | null;
  snapshotMode: "personal" | "community";
  votes: number;
}) {
  const hue = matchRatingHue(display);
  return (
    <div className={`${styles.playerCard} flex-col gap-1.5`} style={{ paddingTop: 10, paddingBottom: 10 }}>
      <span className={`${styles.playerName} line-clamp-2 w-full break-words`} style={{ fontSize: 17 }}>
        {nameLine}
      </span>
      <span
        className={styles.ratingBadge}
        style={{ background: hue.bg, color: hue.text }}
      >
        {fmtMatchRating(display)}
        <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">/10</span>
      </span>
      {snapshotMode === "community" && votes > 0 ? (
        <span className={styles.ratingMeta}>{voteLineCs(votes)}</span>
      ) : null}
      {snapshotMode === "personal" ? (
        <span className={styles.ratingMeta} style={{ color: "rgba(110, 231, 183, 0.85)" }}>
          Tvoje
        </span>
      ) : null}
    </div>
  );
}

interface BaseFixtureNamesFullPosterProps {
  headline: string;
  /** Nadpisek pod červenou linkou (datum zápasu u hodnocení apod.). */
  subline?: string;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  siteUrl?: string;
  footerInstantIso?: string | null;
}

type RatingMap = Record<string, { avg: number; count: number } | undefined>;

const lineupSharedRoot =
  `${styles.root} match-lineup-names-full-poster ${styles.poster}`;

const ratingSharedRoot =
  `${styles.root} match-rating-names-full-poster ${styles.poster}`;

export const MatchLineupNamesFullPoster = forwardRef<HTMLDivElement, BaseFixtureNamesFullPosterProps>(
  function MatchLineupNamesFullPoster(
    { headline, subline, lineup, players, defenseCount, allowExtraForward, siteUrl = "", footerInstantIso = null },
    ref
  ) {
    const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
    const host = siteUrl.replace(/^https?:\/\//, "");
    const titleLine = headline.trim();

    const goalies = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, "goalies", defenseCount, allowExtraForward);
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    const defense = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, "defense", defenseCount, allowExtraForward);
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    const forwards = useMemo(() => {
      const ids12 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-12", defenseCount, allowExtraForward);
      const ids34 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-34", defenseCount, allowExtraForward);
      const ids = [...ids12, ...ids34];
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    return (
      <div ref={ref} data-export-slot="cele-jmena" className={lineupSharedRoot} style={SHARE_POSTER_3X4_STYLE}>
        <div className={styles.bg} aria-hidden />
        <div className={styles.inner}>
          <PosterHeader titleLine={titleLine} subline={subline} />

          <div className={styles.sections}>
            <section className={styles.section}>
              <SectionLabel>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionLabel>
              <div className={styles.grid2}>
                {goalies.map((n, i) => (
                  <PlayerCard key={`goalies-${i}`} nameLine={n} />
                ))}
              </div>
            </section>

            <section className={styles.section} style={{ flex: 1.08 }}>
              <SectionLabel>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionLabel>
              <div className={styles.grid2} style={{ maxWidth: 700 }}>
                {defense.map((n, i) => (
                  <PlayerCard key={`defense-${i}`} nameLine={n} />
                ))}
              </div>
            </section>

            <section className={styles.section} style={{ flex: 1.32 }}>
              <SectionLabel>Útočníci</SectionLabel>
              <div className={styles.grid3}>
                {forwards.map((n, i) => (
                  <PlayerCard key={`forwards-${i}`} nameLine={n} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <NamesFooter dateLabel={dateLabel} host={host} footerTag="Soupiska zápasu" />
      </div>
    );
  }
);

export const MatchRatingNamesFullPoster = forwardRef<
  HTMLDivElement,
  BaseFixtureNamesFullPosterProps & {
    ratings: RatingMap;
    myRatings: MatchRatingMyMap;
    snapshotMode: "personal" | "community";
  }
>(function MatchRatingNamesFullPoster(
  {
    headline,
    subline,
    lineup,
    players,
    defenseCount,
    allowExtraForward,
    ratings,
    myRatings,
    snapshotMode,
    siteUrl = "",
    footerInstantIso = null,
  },
  ref
) {
  const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
  const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
  const host = siteUrl.replace(/^https?:\/\//, "");
  const titleLine = headline.trim();

  const renderPills = useMemo(() => {
    return (ids: string[]) =>
      ids.map((id) => {
        const agg = ratings[id];
        const votes = typeof agg?.count === "number" && Number.isFinite(agg.count) ? agg.count : 0;
        const display = resolveMatchRatingDisplay(id, ratings, myRatings, snapshotMode);
        return (
          <RatingNamePill
            key={id}
            nameLine={rosterLastDisplay(players, id)}
            display={display}
            snapshotMode={snapshotMode}
            votes={votes}
          />
        );
      });
  }, [players, ratings, myRatings, snapshotMode]);

  const goalieIds = useMemo(
    () => pickMatchLineupSegmentPlayerIds(lineup, "goalies", defenseCount, allowExtraForward),
    [lineup, defenseCount, allowExtraForward]
  );
  const defenseIds = useMemo(
    () => pickMatchLineupSegmentPlayerIds(lineup, "defense", defenseCount, allowExtraForward),
    [lineup, defenseCount, allowExtraForward]
  );
  const forwardIds = useMemo(() => {
    const ids12 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-12", defenseCount, allowExtraForward);
    const ids34 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-34", defenseCount, allowExtraForward);
    return [...ids12, ...ids34];
  }, [lineup, defenseCount, allowExtraForward]);

  return (
    <div ref={ref} data-export-slot="cele-jmena" className={`${ratingSharedRoot} flex flex-col`} style={SHARE_POSTER_3X4_STYLE}>
      <div className={styles.bg} aria-hidden />
      <div className={styles.inner}>
        <PosterHeader eyebrow="Hodnocení hráčů" titleLine={titleLine} subline={subline} />

        <div className={styles.sections}>
          <section className={styles.section}>
            <SectionLabel>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionLabel>
            <div className={styles.grid2}>
              {renderPills(goalieIds)}
            </div>
          </section>

          <section className={styles.section} style={{ flex: 1.08 }}>
            <SectionLabel>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionLabel>
            <div className={styles.grid2} style={{ maxWidth: 700 }}>
              {renderPills(defenseIds)}
            </div>
          </section>

          <section className={styles.section} style={{ flex: 1.32 }}>
            <SectionLabel>Útočníci</SectionLabel>
            <div className={styles.grid3}>
              {renderPills(forwardIds)}
            </div>
          </section>
        </div>
      </div>

      <NamesFooter dateLabel={dateLabel} host={host} footerTag="Hodnocení zápasu" />
    </div>
  );
}
);

function DecorativeBg() {
  return null;
}

function PosterHeader({
  eyebrow,
  titleLine,
  subline,
}: {
  eyebrow?: string;
  titleLine: string;
  subline?: string;
}) {
  return (
    <header className={styles.titleBlock}>
      <p className={styles.eyebrow}>{eyebrow ?? "Matchday lineup"}</p>
      {titleLine ? (
        <h1 className={`${styles.title} line-clamp-3`}>{titleLine}</h1>
      ) : null}
      {subline ? <p className={styles.subline}>{subline}</p> : null}
    </header>
  );
}

function NamesFooter({
  dateLabel,
  host,
  footerTag,
}: {
  dateLabel: string;
  host: string;
  footerTag: string;
}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerSide}>
        <p className={styles.footerTag}>{footerTag}</p>
      </div>
      <div className={styles.footerCenter}>
        <p className={styles.footerWhen}>Exportováno {dateLabel}</p>
        <p className={styles.footerBrand}>{host || "hokejlineup.cz"}</p>
      </div>
      <div className={styles.footerSide} aria-hidden />
    </footer>
  );
}
