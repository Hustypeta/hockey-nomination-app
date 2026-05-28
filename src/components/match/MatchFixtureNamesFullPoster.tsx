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

function IconGoalie() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c3.9 0 7 3.1 7 7v2.3c0 4.7-3.3 8.8-7 8.8s-7-4.1-7-8.8V10c0-3.9 3.1-7 7-7Z"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
      />
      <path
        d="M8.8 11.2c1.2-1 2.6-1.5 3.2-1.5.7 0 2 .5 3.2 1.5"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.2 16.7h5.6"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDefense() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v7c0 5-3.7 8.7-7 9-3.3-.3-7-4-7-9V6l7-3Z"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconForwards() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17l10-10"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 9l4 4"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 15l4 4"
        stroke="rgba(226,232,240,0.9)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.sectionLabelRow}>
      <span className={styles.sectionRule} aria-hidden />
      <span className={styles.sectionChip}>
        <span className={styles.sectionIcon} aria-hidden>
          {icon}
        </span>
        {children}
      </span>
      <span className={styles.sectionRule} aria-hidden />
    </div>
  );
}

function NameTile({ nameLine, markIcon }: { nameLine: string; markIcon: ReactNode }) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileInner}>
        <span className={styles.tileMark} aria-hidden>
          {markIcon}
        </span>
        <span className={`${styles.tileName} line-clamp-1`}>{nameLine}</span>
      </div>
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
    <div className={styles.tile}>
      <div className={styles.tileInner} style={{ gridTemplateColumns: "1fr" }}>
        <span className={`${styles.tileName} line-clamp-1`} style={{ fontSize: 19 }}>
          {nameLine}
        </span>
      </div>
      <span
        className="inline-flex items-baseline gap-1 rounded-lg px-2.5 py-0.5 font-display text-[15px] font-black tabular-nums sm:text-[16px]"
        style={{ background: hue.bg, color: hue.text, boxShadow: `0 0 0 1px rgba(255,255,255,0.85) inset` }}
      >
        {fmtMatchRating(display)}
        <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">/10</span>
      </span>
      {snapshotMode === "community" && votes > 0 ? (
        <span className="text-[9px] font-semibold text-slate-500 sm:text-[10px]">{voteLineCs(votes)}</span>
      ) : null}
      {snapshotMode === "personal" ? (
        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-700/90">Tvoje</span>
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
          <header className={styles.header}>
            <p className={styles.kicker}>SESTAVA NA ZÁPAS</p>
            <h1 className={`${styles.title} line-clamp-3`}>{titleLine || "Moje sestava na zápas"}</h1>
            {subline ? <p className={styles.subline}>{subline}</p> : null}
          </header>

          <div className={styles.field}>
            <section>
              <SectionLabel icon={<IconGoalie />}>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionLabel>
              <div className={styles.gridGoalies}>
                {goalies.map((n, i) => (
                  <NameTile key={`goalies-${i}`} nameLine={n} markIcon={<IconGoalie />} />
                ))}
              </div>
            </section>

            <section>
              <SectionLabel icon={<IconDefense />}>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionLabel>
              <div className={styles.gridDefense}>
                {defense.map((n, i) => (
                  <NameTile key={`defense-${i}`} nameLine={n} markIcon={<IconDefense />} />
                ))}
              </div>
            </section>

            <section>
              <SectionLabel icon={<IconForwards />}>Útočníci</SectionLabel>
              <div className={styles.gridForwards}>
                {forwards.map((n, i) => (
                  <NameTile key={`forwards-${i}`} nameLine={n} markIcon={<IconForwards />} />
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={`${styles.footerItem}`} style={{ justifyContent: "flex-start" }}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 3h10v18H7z" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" />
              <path d="M9 7h6M9 11h6M9 15h6" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Soupiska zápasu
          </div>
          <div className={styles.footerItem}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 4v2M17 4v2M5 9h14" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M6 6h12a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Z" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" />
            </svg>
            {dateLabel}
          </div>
          <div className={`${styles.footerItem} ${styles.brand}`}>{host || "hokejlineup.cz"}</div>
        </footer>
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
        <header className={styles.header}>
          <p className={styles.kicker}>HODNOCENÍ ZÁPASU</p>
          <h1 className={`${styles.title} line-clamp-3`}>{titleLine || "Moje sestava na zápas"}</h1>
          {subline ? <p className={styles.subline}>{subline}</p> : null}
        </header>

        <div className={styles.field}>
          <section>
            <SectionLabel icon={<IconGoalie />}>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionLabel>
            <div className={styles.gridGoalies}>{renderPills(goalieIds)}</div>
          </section>

          <section>
            <SectionLabel icon={<IconDefense />}>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionLabel>
            <div className={styles.gridDefense}>{renderPills(defenseIds)}</div>
          </section>

          <section>
            <SectionLabel icon={<IconForwards />}>Útočníci</SectionLabel>
            <div className={styles.gridForwards}>{renderPills(forwardIds)}</div>
          </section>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.footerItem}`} style={{ justifyContent: "flex-start" }}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M7 3h10v18H7z" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" />
            <path d="M9 7h6M9 11h6M9 15h6" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Hodnocení zápasu
        </div>
        <div className={styles.footerItem}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M7 4v2M17 4v2M5 9h14" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M6 6h12a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Z" stroke="rgba(226,232,240,0.85)" strokeWidth="1.6" />
          </svg>
          {dateLabel}
        </div>
        <div className={`${styles.footerItem} ${styles.brand}`}>{host || "hokejlineup.cz"}</div>
      </footer>
    </div>
  );
}
);

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
    <header className="max-w-[72%] shrink-0 pr-2">
      {eyebrow ? (
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-[#c8102e]/95">{eyebrow}</p>
      ) : null}
      {titleLine ? (
        <h1 className={`line-clamp-3 font-display text-[1.5rem] font-bold leading-[1.1] tracking-wide text-white sm:text-[1.72rem] ${eyebrow ? "mt-2" : ""}`}>
          {titleLine}
        </h1>
      ) : null}
      {subline ? <p className="mt-1.5 font-display text-sm text-white/52">{subline}</p> : null}
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
    <footer className="relative z-[1] mt-auto flex shrink-0 flex-col gap-2 border-t border-white/[0.09] bg-black/45 px-8 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-10">
      <div className="max-w-[46%] text-left text-[11px] leading-snug text-white/55 sm:text-[12px]">
        <p className="font-display font-bold tracking-wide text-[#c8102e]">{footerTag}</p>
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-[13px] font-medium text-white/78">Exportováno {dateLabel}</p>
        <p className="mt-1.5 font-display text-[22px] font-black tracking-[0.14em] text-[#7ec8ff] sm:text-[24px]">
          {host || "hokejlineup.cz"}
        </p>
      </div>
      <div className="hidden w-[46%] sm:block" aria-hidden />
    </footer>
  );
}
