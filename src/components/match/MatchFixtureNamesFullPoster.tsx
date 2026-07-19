"use client";

import { Fragment, forwardRef, useMemo, useState, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { SHARE_POSTER_3X4_STYLE, SHARE_POSTER_ROSTER_4X5_STYLE } from "@/lib/sharePosterLayout";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
} from "@/lib/matchLineupPosterSegments";
import { rosterLastDisplay } from "@/lib/namesOnlyRoster";
import { SITE_CANONICAL_HOST, SITE_LOGO_URL } from "@/lib/siteBranding";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import styles from "./MatchFixtureNamesFullPoster.module.css";

const LINEUP_NAMES_BACKGROUND_SRC = "/images/poster-lineup-names-bg.png";

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.26em] text-white/92 antialiased sm:mb-5 sm:text-[15px]">
      {children}
    </h3>
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
  badge,
}: {
  nameLine: string;
  display: number | null;
  snapshotMode: "personal" | "community";
  votes: number;
  badge?: string;
}) {
  const hue = matchRatingHue(display);
  return (
    <div className="flex min-h-[3.35rem] flex-col items-center justify-center gap-1.5 rounded-xl bg-white/[0.96] px-3 py-2.5 text-center shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[3.6rem]">
      {badge ? (
        <span className="rounded-full bg-[#0a2463] px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-white">
          {badge}
        </span>
      ) : null}
      <span className="line-clamp-2 w-full break-words font-sans text-[17px] font-bold leading-snug tracking-wide text-[#0a1628] sm:text-[18px]">
        {nameLine}
      </span>
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

function compactRosterName(players: Player[], id: string): string {
  const player = players.find((candidate) => candidate.id === id);
  if (!player) return "—";
  const parts = player.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return (parts[0] ?? "—").toLocaleUpperCase("cs-CZ");
  const first = parts[0]!;
  const last = parts[parts.length - 1]!;
  return `${first.charAt(0).toLocaleUpperCase("cs-CZ")}. ${last.toLocaleUpperCase("cs-CZ")}`;
}

function NamesRows({ names, columns }: { names: string[]; columns: 2 | 3 }) {
  const rows: string[][] = [];
  for (let index = 0; index < names.length; index += columns) {
    rows.push(names.slice(index, index + columns));
  }

  return (
    <div className={styles.rows}>
      {rows.map((row, rowIndex) => (
        <div className={styles.row} key={`row-${rowIndex}`}>
          {row.map((name, nameIndex) => {
            const compactLength = name.replace(/\s/g, "").length;
            const fontSize =
              columns === 3 && compactLength > 13
                ? 27
                : columns === 3 && compactLength > 11
                  ? 29
                  : columns === 2 && compactLength > 15
                    ? 30
                    : undefined;
            return (
              <Fragment key={`${name}-${nameIndex}`}>
                {nameIndex > 0 ? <span className={styles.connector} aria-hidden /> : null}
                <div
                  className={
                    name === "—"
                      ? `${styles.box} ${columns === 2 ? styles.boxTwo : styles.boxThree} ${styles.empty}`
                      : `${styles.box} ${columns === 2 ? styles.boxTwo : styles.boxThree}`
                  }
                >
                  <span style={fontSize ? { fontSize } : undefined}>{name}</span>
                </div>
              </Fragment>
            );
          })}
        </div>
      ))}
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

const ratingSharedRoot =
  "match-rating-names-full-poster relative shrink-0 overflow-hidden rounded-[64px] border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]";

export const MatchLineupNamesFullPoster = forwardRef<HTMLDivElement, BaseFixtureNamesFullPosterProps>(
  function MatchLineupNamesFullPoster(
    { headline, lineup, players, defenseCount, allowExtraForward, siteUrl = "" },
    ref
  ) {
    const host =
      siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").trim() || SITE_CANONICAL_HOST;
    const titleLine = headline.trim();

    const goalies = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, "goalies", defenseCount, allowExtraForward);
      return ids.map((id) => compactRosterName(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    const defense = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, "defense", defenseCount, allowExtraForward);
      return ids.map((id) => compactRosterName(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    const forwards = useMemo(() => {
      const ids12 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-12", defenseCount, allowExtraForward);
      const ids34 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-34", defenseCount, allowExtraForward);
      const ids = [...ids12, ...ids34];
      if (allowExtraForward && lineup.extraForwards[0] && !ids.includes(lineup.extraForwards[0])) {
        ids.push(lineup.extraForwards[0]);
      }
      return ids.map((id) => compactRosterName(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    return (
      <div
        ref={ref}
        data-export-slot="cele-jmena"
        className={`match-lineup-names-full-poster ${styles.poster}`}
        style={SHARE_POSTER_ROSTER_4X5_STYLE}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- uživatelem dodané pozadí exportního plakátu */}
        <img src={LINEUP_NAMES_BACKGROUND_SRC} alt="" className={styles.background} decoding="sync" />
        <div className={styles.shade} aria-hidden />

        <header className={styles.header}>
          <span className={styles.host}>{host}</span>
          <h1 className={styles.title}>{titleLine || "Moje sestava na zápas"}</h1>
          <span className={styles.logoFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element -- statické logo pro export PNG */}
            <img src={SITE_LOGO_URL} alt="Lineup" className={styles.logo} decoding="sync" />
          </span>
        </header>
        <div className={styles.headerRule} aria-hidden />

        <main className={styles.content}>
          <section className={`${styles.section} ${styles.sectionGoalies}`}>
            <h2 className={styles.sectionTitle}>Brankáři</h2>
            <NamesRows names={goalies} columns={2} />
          </section>

          <section className={`${styles.section} ${styles.sectionDefense}`}>
            <h2 className={styles.sectionTitle}>Obránci</h2>
            <NamesRows names={defense} columns={2} />
          </section>

          <section className={`${styles.section} ${styles.sectionForwards}`}>
            <h2 className={styles.sectionTitle}>Útočníci</h2>
            <NamesRows names={forwards} columns={3} />
          </section>
        </main>
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
    return (ids: string[], goalieLabels = false) =>
      ids.map((id, index) => {
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
            badge={goalieLabels ? `${index + 1}. brankář` : undefined}
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
      <DecorativeBg />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-8 pb-2 pt-8 sm:px-10 sm:pt-9">
        <PosterHeader eyebrow="Hodnocení hráčů" titleLine={titleLine} subline={subline} />

        <div className="mt-6 flex min-h-0 flex-1 flex-col justify-between py-3 sm:mt-7 sm:py-5">
          <section className="flex shrink-0 flex-col justify-center">
            <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionTitle>
            <div className="mx-auto grid w-full max-w-[520px] grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-x-4 sm:gap-y-4">
              {renderPills(goalieIds, true)}
            </div>
          </section>

          <section className="flex min-h-0 flex-[1.15] flex-col justify-center">
            <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionTitle>
            <div className="mx-auto grid w-full max-w-[640px] grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-x-4 sm:gap-y-4">
              {renderPills(defenseIds)}
            </div>
          </section>

          <section className="flex min-h-0 flex-[1.55] flex-col justify-center">
            <SectionTitle>Útočníci</SectionTitle>
            <div className="mx-auto grid w-full max-w-[920px] grid-cols-3 gap-x-3 gap-y-3.5 sm:gap-x-4 sm:gap-y-4">
              {renderPills(forwardIds)}
            </div>
          </section>
        </div>
      </div>

      <NamesFooter dateLabel={dateLabel} host={host} footerTag="Hodnocení zápasu" />
    </div>
  );
}
);function DecorativeBg() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-br from-[#c8102e] via-[#8f0b22] to-[#003087]"
        style={{
          borderTopLeftRadius: "110px",
          borderBottomLeftRadius: "110px",
          transform: "translateX(12%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-8 right-[36%] w-px bg-gradient-to-b from-transparent via-white/25 to-transparent opacity-70"
        aria-hidden
      />
    </>
  );
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
