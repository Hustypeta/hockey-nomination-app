"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import type { LineupStructure, Player } from "@/types";
import { getAmbiguousLastNameKeys } from "@/lib/jerseyDisplayName";
import { Nhl25JerseyCard } from "@/components/sestava/Nhl25JerseyCard";
import { SHARE_POSTER_ROSTER_4X5_STYLE } from "@/lib/sharePosterLayout";
import { SITE_CANONICAL_HOST, SITE_LOGO_URL } from "@/lib/siteBranding";
import {
  defensePairForForwardLine,
  MATCH_LINEUP_EXTRA_FORWARD_LABEL,
} from "@/lib/matchLineupPosterSegments";
import { MainLineupGrid } from "@/components/match/lineup-poster/MatchLineupPosterLineLayout";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingAggregateMap,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import {
  loadPosterIceBgAsDataUrl,
  posterRosterIceBgUrl,
  POSTER_ROSTER_ICE_BG_REVISION,
} from "@/lib/posterRosterIceBg";
import styles from "./MatchLineupFullJerseyPoster.module.css";

interface MatchLineupFullJerseyExportPosterProps {
  lineupTitle: string;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  siteUrl?: string;
  jerseyRatingExport?: {
    ratings: MatchRatingAggregateMap;
    myRatings: MatchRatingMyMap;
    snapshotMode: "personal" | "community";
  };
}

function MatchJerseyRatingBadge({
  pid,
  jerseyRatingExport,
}: {
  pid: string;
  jerseyRatingExport: NonNullable<MatchLineupFullJerseyExportPosterProps["jerseyRatingExport"]>;
}) {
  const mode = jerseyRatingExport.snapshotMode;
  const display = resolveMatchRatingDisplay(
    pid,
    jerseyRatingExport.ratings,
    jerseyRatingExport.myRatings,
    mode
  );
  const aggregate = jerseyRatingExport.ratings[pid];
  const hue = matchRatingHue(display);
  return (
    <div className="mt-0.5 flex flex-col items-center gap-0.5">
      <div
        className="inline-flex items-baseline gap-0.5 rounded-md border border-slate-300 px-1.5 py-0.5"
        style={{
          background: hue.bg,
          color: hue.text,
          boxShadow: `0 2px 8px ${hue.ring}`,
        }}
      >
        <span className="font-display text-[0.9rem] font-black tabular-nums leading-none tracking-tight">
          {fmtMatchRating(display)}
        </span>
        <span className="text-[7px] font-extrabold uppercase tracking-wider opacity-85">/10</span>
      </div>
      {mode === "community" && aggregate && aggregate.count > 0 ? (
        <span className="text-[8px] font-semibold text-slate-600">{aggregate.count} hlasů</span>
      ) : null}
      {mode === "personal" && typeof jerseyRatingExport.myRatings[pid] !== "number" ? (
        <span className="text-[8px] font-semibold text-slate-500">Neuloženo</span>
      ) : null}
    </div>
  );
}

/**
 * Celá zápasová soupiska s dresy — brankáři (+ volitelně 13. útočník) nahoře, 4 lajny ve čtvercích.
 */
export const MatchLineupFullJerseyExportPoster = forwardRef<HTMLDivElement, MatchLineupFullJerseyExportPosterProps>(
  function MatchLineupFullJerseyExportPoster(
    { lineupTitle, players, lineup, defenseCount, allowExtraForward, siteUrl = "", jerseyRatingExport },
    ref
  ) {
    const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
    const [iceBgSrc, setIceBgSrc] = useState(posterRosterIceBgUrl());

    useEffect(() => {
      let cancelled = false;
      loadPosterIceBgAsDataUrl(POSTER_ROSTER_ICE_BG_REVISION)
        .then((src) => {
          if (!cancelled) setIceBgSrc(src);
        })
        .catch(() => {
          if (!cancelled) setIceBgSrc(posterRosterIceBgUrl());
        });
      return () => {
        cancelled = true;
      };
    }, []);

    const extraForwardId =
      allowExtraForward && lineup.extraForwards[0] ? lineup.extraForwards[0] : null;
    const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) ?? null : null);
    const titleLine = (() => {
      const trimmed = lineupTitle.trim();
      if (!trimmed) return "";
      return trimmed.charAt(0).toLocaleUpperCase("cs-CZ") + trimmed.slice(1);
    })();
    const host =
      siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").trim() || SITE_CANONICAL_HOST;

    const renderSlot = (pid: string | null, positionLabel: string, reactKey: string) => (
      <div key={reactKey} className={`${styles.jerseyTile} flex min-w-0 flex-col gap-0`}>
        <Nhl25JerseyCard
          player={getPlayer(pid)}
          positionLabel={positionLabel}
          size="compact"
          nameplateVariant="poster"
          ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
          hidePositionLabel
          hidePosterFlag
          disableMotion
          posterUniformNames
        />
        {jerseyRatingExport && pid ? (
          <MatchJerseyRatingBadge pid={pid} jerseyRatingExport={jerseyRatingExport} />
        ) : null}
      </div>
    );

    const renderLineCell = (lineIdx: number, heading: string) => {
      const f = lineup.forwardLines[lineIdx];
      const d = defensePairForForwardLine(lineIdx, lineup, defenseCount);
      const lineToneClass =
        lineIdx === 0
          ? styles.cellLineTone1
          : lineIdx === 1
            ? styles.cellLineTone2
            : lineIdx === 2
              ? styles.cellLineTone3
              : styles.cellLineTone4;
      const forwards = [
        renderSlot(f?.lw ?? null, "LW", `ln${lineIdx}-lw`),
        renderSlot(f?.c ?? null, "C", `ln${lineIdx}-c`),
        renderSlot(f?.rw ?? null, "RW", `ln${lineIdx}-rw`),
      ];
      const defense = [
        renderSlot(d.lb, "LB", `ln${lineIdx}-lb`),
        renderSlot(d.rb, "RB", `ln${lineIdx}-rb`),
      ];

      const lineFrameCornerClass =
        lineIdx === 0
          ? styles.lineFrameOuterTl
          : lineIdx === 1
            ? styles.lineFrameOuterTr
            : lineIdx === 2
              ? styles.lineFrameOuterBl
              : styles.lineFrameOuterBr;

      return (
        <section className={`${styles.cell} ${styles.cellLine} ${lineToneClass}`} key={`line-${lineIdx}`}>
          <div className={`${styles.lineFrame} ${lineFrameCornerClass}`}>
            <h2 className={styles.cellHeading}>
              <span className={styles.cellHeadingText}>{heading}</span>
            </h2>
            <div className={styles.cellBody}>
              <div className={styles.lineGrid}>
                <MainLineupGrid
                  forwards={forwards}
                  defense={defense}
                  goalie={null}
                  variant="light"
                  compact
                />
              </div>
            </div>
          </div>
        </section>
      );
    };

    return (
      <div
        ref={ref}
        data-export-slot="cele-dresy"
        data-poster-surface="light"
        className={`match-lineup-full-jersey-poster ${styles.posterRoot} ${styles.posterLineFramesOff}`}
        style={SHARE_POSTER_ROSTER_4X5_STYLE}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- statické pozadí od uživatele pro export PNG */}
        <img
          src={iceBgSrc}
          alt=""
          data-poster-ice-bg=""
          className={styles.iceBg}
          decoding="sync"
          draggable={false}
        />

        <div className={styles.posterSurface}>
          <header className={styles.topBar}>
            <span className={styles.brandHost}>{host}</span>
            {titleLine ? (
              <h1 className={styles.title}>
                <span className={styles.titleText}>{titleLine}</span>
              </h1>
            ) : (
              <span className={styles.titleSpacer} aria-hidden />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- statické logo pro export PNG */}
            <img
              src={SITE_LOGO_URL}
              alt="Lineup"
              width={480}
              height={120}
              className={styles.brandLogo}
              decoding="sync"
            />
          </header>

          <div className={styles.posterBody}>
          <div className={styles.posterLanes}>
            <section className={`${styles.goalieBlock} ${extraForwardId ? styles.goalieBlockWithExtra : ""}`}>
              <div className={styles.goalieMain}>
                <h2 className={styles.cellHeading}>
                  <span className={styles.cellHeadingText}>Brankáři</span>
                </h2>
                <div className={styles.goaliePair}>
                  <div className={styles.goalieSlot}>
                    {renderSlot(lineup.goalies[0] ?? null, "G", "g1")}
                  </div>
                  <div className={styles.goalieSlot}>
                    {renderSlot(lineup.goalies[1] ?? null, "G", "g2")}
                  </div>
                </div>
              </div>
              {extraForwardId ? (
                <div className={styles.goalieExtraSlot}>
                  <h2 className={styles.cellHeading}>
                    <span className={styles.cellHeadingText}>{MATCH_LINEUP_EXTRA_FORWARD_LABEL}</span>
                  </h2>
                  {renderSlot(extraForwardId, "F", "xf-extra")}
                </div>
              ) : null}
            </section>

            <div className={styles.linesGridWrap}>
              <div className={styles.rinkCenterCircle} aria-hidden />
              <div className={styles.linesGrid}>
                {renderLineCell(0, "1. lajna")}
                {renderLineCell(1, "2. lajna")}
                {renderLineCell(2, "3. lajna")}
                {renderLineCell(3, "4. lajna")}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
);
