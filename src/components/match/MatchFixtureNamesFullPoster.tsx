"use client";

import {
  Fragment,
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { LineupStructure, Player } from "@/types";
import { SHARE_POSTER_3X4_STYLE, SHARE_POSTER_ROSTER_4X5_STYLE } from "@/lib/sharePosterLayout";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
} from "@/lib/matchLineupPosterSegments";
import {
  rosterDisplayNamesForIds,
  rosterLastDisplay,
} from "@/lib/namesOnlyRoster";
import { nameplateWidthScore } from "@/lib/jerseyNameplate";
import { SITE_CANONICAL_HOST, SITE_LOGO_URL } from "@/lib/siteBranding";
import { MATCH_LINEUP_SHARE_TITLE_DEFAULT } from "@/lib/matchLineupShareTitle";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import { inferLineupPoolKey, namesPosterBgForPool } from "@/lib/jerseyPhotoAsset";
import styles from "./MatchFixtureNamesFullPoster.module.css";

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
  leadership,
}: {
  nameLine: string;
  display: number | null;
  snapshotMode: "personal" | "community";
  votes: number;
  badge?: string;
  leadership?: "C" | "A" | null;
}) {
  const hue = matchRatingHue(display);
  return (
    <div className="flex min-h-[3.35rem] flex-col items-center justify-center gap-1.5 rounded-xl bg-white/[0.96] px-3 py-2.5 text-center shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[3.6rem]">
      {badge ? (
        <span className="rounded-full bg-[#0a2463] px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-white">
          {badge}
        </span>
      ) : null}
      <span className="inline-flex max-w-full items-center justify-center gap-1">
        <span className="line-clamp-2 min-w-0 break-words font-sans text-[17px] font-bold leading-snug tracking-wide text-[#0a1628] sm:text-[18px]">
          {nameLine}
        </span>
        {leadership === "C" ? (
          <span
            className="inline-flex h-[1.05em] min-w-[1.05em] shrink-0 items-center justify-center rounded-[2px] bg-[#c8102e] px-[0.14em] font-display text-[0.72em] font-black leading-none text-white"
            aria-label="Kapitán"
          >
            C
          </span>
        ) : null}
        {leadership === "A" ? (
          <span
            className="inline-flex h-[1.05em] min-w-[1.05em] shrink-0 items-center justify-center rounded-[2px] bg-[#003087] px-[0.14em] font-display text-[0.68em] font-black leading-none text-white"
            aria-label="Asistent kapitána"
          >
            A
          </span>
        ) : null}
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

function posterNameStyle(name: string, columns: 2 | 3): CSSProperties | undefined {
  if (name === "—") return undefined;
  const score = nameplateWidthScore(name);
  const baseFontPx = columns === 3 ? 31 : 34;
  // Inner box minus padding, border and optional C/A mark — never rely on ellipsis.
  const availablePx = columns === 3 ? 200 : 250;
  const fontSize = Math.min(baseFontPx, availablePx / Math.max(1, score * 0.78));
  return {
    fontSize: `${Math.round(fontSize * 100) / 100}px`,
    letterSpacing: score > 11 ? "0" : score > 9 ? "0.006em" : undefined,
  };
}

function FittedBoxName({
  name,
  columns,
  hasMark,
}: {
  name: string;
  columns: 2 | 3;
  hasMark: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const style = posterNameStyle(name, columns);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || name === "—") return;
    const estimated = posterNameStyle(name, columns);
    const rawSize = estimated?.fontSize;
    let size =
      (typeof rawSize === "number" ? rawSize : parseFloat(String(rawSize ?? ""))) ||
      (columns === 3 ? 31 : 34);
    el.style.fontSize = `${size}px`;
    while (size > 14 && el.scrollWidth > el.clientWidth + 0.5) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [name, columns, hasMark]);

  return (
    <span ref={ref} className={styles.boxName} style={style}>
      {name}
    </span>
  );
}

function NamesRows({
  entries,
  columns,
}: {
  entries: Array<{ name: string; mark?: "C" | "A" | null }>;
  columns: 2 | 3;
}) {
  const rows: Array<Array<{ name: string; mark?: "C" | "A" | null }>> = [];
  for (let index = 0; index < entries.length; index += columns) {
    rows.push(entries.slice(index, index + columns));
  }

  return (
    <div className={styles.rows}>
      {rows.map((row, rowIndex) => (
        <div className={styles.row} key={`row-${rowIndex}`}>
          {row.map((entry, nameIndex) => {
            return (
              <Fragment key={`${entry.name}-${nameIndex}`}>
                {nameIndex > 0 ? <span className={styles.connector} aria-hidden /> : null}
                <div
                  className={
                    entry.name === "—"
                      ? `${styles.box} ${columns === 2 ? styles.boxTwo : styles.boxThree} ${styles.empty}`
                      : `${styles.box} ${columns === 2 ? styles.boxTwo : styles.boxThree}`
                  }
                >
                  <FittedBoxName
                    name={entry.name}
                    columns={columns}
                    hasMark={Boolean(entry.mark)}
                  />
                  {entry.mark === "C" ? (
                    <span className={`${styles.boxMark} ${styles.boxMarkCaptain}`} aria-label="Kapitán">
                      C
                    </span>
                  ) : null}
                  {entry.mark === "A" ? (
                    <span className={`${styles.boxMark} ${styles.boxMarkAssistant}`} aria-label="Asistent kapitána">
                      A
                    </span>
                  ) : null}
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
  /** Pool sestavy — řídí pozadí plakátu „jen jména“ (Pardubice / Kometa / národák). */
  poolKey?: string | null;
  captainId?: string | null;
}

function leadershipMark(
  playerId: string | null | undefined,
  captainId: string | null | undefined,
  assistantIds: string[]
): "C" | "A" | null {
  if (!playerId) return null;
  if (captainId && captainId === playerId) return "C";
  if (assistantIds.includes(playerId)) return "A";
  return null;
}

type RatingMap = Record<string, { avg: number; count: number } | undefined>;

const ratingSharedRoot =
  "match-rating-names-full-poster relative shrink-0 overflow-hidden rounded-[64px] border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]";

export const MatchLineupNamesFullPoster = forwardRef<HTMLDivElement, BaseFixtureNamesFullPosterProps>(
  function MatchLineupNamesFullPoster(
    {
      headline,
      lineup,
      players,
      defenseCount,
      allowExtraForward,
      siteUrl = "",
      poolKey: poolKeyProp,
      captainId = null,
    },
    ref
  ) {
    const host =
      siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").trim() || SITE_CANONICAL_HOST;
    const titleLine = headline.trim();
    const poolKey = useMemo(
      () => inferLineupPoolKey(players, poolKeyProp),
      [players, poolKeyProp]
    );
    const backgroundSrc = namesPosterBgForPool(poolKey);

    const roster = useMemo(() => {
      const aids = lineup.assistantIds ?? [];
      const goalieIds = pickMatchLineupSegmentPlayerIds(
        lineup,
        "goalies",
        defenseCount,
        allowExtraForward
      );
      const defenseIds = pickMatchLineupSegmentPlayerIds(
        lineup,
        "defense",
        defenseCount,
        allowExtraForward
      );
      const forwardIds = [
        ...pickMatchLineupSegmentPlayerIds(
          lineup,
          "forwards-12",
          defenseCount,
          allowExtraForward
        ),
        ...pickMatchLineupSegmentPlayerIds(
          lineup,
          "forwards-34",
          defenseCount,
          allowExtraForward
        ),
      ];
      if (
        allowExtraForward &&
        lineup.extraForwards[0] &&
        !forwardIds.includes(lineup.extraForwards[0])
      ) {
        forwardIds.push(lineup.extraForwards[0]);
      }
      const displayNames = rosterDisplayNamesForIds(players, [
        ...goalieIds,
        ...defenseIds,
        ...forwardIds,
      ]);
      const entries = (ids: string[]) =>
        ids.map((id) => ({
          name: displayNames.get(id) ?? "—",
          mark: leadershipMark(id, captainId, aids),
        }));

      return {
        goalies: entries(goalieIds),
        defense: entries(defenseIds),
        forwards: entries(forwardIds),
      };
    }, [lineup, players, defenseCount, allowExtraForward, captainId]);

    const goalies = roster.goalies;
    const defense = roster.defense;
    const forwards = roster.forwards;

    return (
      <div
        ref={ref}
        data-export-slot="cele-jmena"
        className={`match-lineup-names-full-poster ${styles.poster}`}
        style={SHARE_POSTER_ROSTER_4X5_STYLE}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- uživatelem dodané pozadí exportního plakátu */}
        <img src={backgroundSrc} alt="" className={styles.background} decoding="sync" />
        <div className={styles.shade} aria-hidden />

        <header className={styles.header}>
          <span className={styles.host}>{host}</span>
          <h1 className={styles.title}>{titleLine || MATCH_LINEUP_SHARE_TITLE_DEFAULT}</h1>
          <span className={styles.logoFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element -- statické logo pro export PNG */}
            <img src={SITE_LOGO_URL} alt="Lineup" className={styles.logo} decoding="sync" />
          </span>
        </header>
        <div className={styles.headerRule} aria-hidden />

        <main className={styles.content}>
          <section className={`${styles.section} ${styles.sectionGoalies}`}>
            <h2 className={styles.sectionTitle}>Brankáři</h2>
            <NamesRows entries={goalies} columns={2} />
          </section>

          <section className={`${styles.section} ${styles.sectionDefense}`}>
            <h2 className={styles.sectionTitle}>Obránci</h2>
            <NamesRows entries={defense} columns={2} />
          </section>

          <section className={`${styles.section} ${styles.sectionForwards}`}>
            <h2 className={styles.sectionTitle}>Útočníci</h2>
            <NamesRows entries={forwards} columns={3} />
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
    captainId = null,
  },
  ref
) {
  const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
  const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
  const host = siteUrl.replace(/^https?:\/\//, "");
  const titleLine = headline.trim();

  const renderPills = useMemo(() => {
    const assistantIds = lineup.assistantIds ?? [];
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
            leadership={leadershipMark(id, captainId, assistantIds)}
          />
        );
      });
  }, [players, ratings, myRatings, snapshotMode, captainId, lineup]);

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
