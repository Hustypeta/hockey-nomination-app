"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { getAmbiguousLastNameKeys } from "@/lib/jerseyDisplayName";
import { Nhl25JerseyCard } from "@/components/sestava/Nhl25JerseyCard";
import { SHARE_POSTER_3X4_STYLE } from "@/lib/sharePosterLayout";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingAggregateMap,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import styles from "./MatchLineupFullJerseyExportPoster.module.css";

const JERSEY_SLOT_MAX_W = "mx-auto w-full max-w-[8.85rem]";

function PosterJerseyWrap({ children }: { children: ReactNode }) {
  return <div className="flex w-full justify-center overflow-visible">{children}</div>;
}

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
        className="inline-flex items-baseline gap-0.5 rounded-lg border-2 border-white/90 px-2 py-0.5"
        style={{
          background: hue.bg,
          color: hue.text,
          boxShadow: `0 6px 16px ${hue.ring}, 0 0 0 2px rgba(255,255,255,0.9) inset`,
        }}
      >
        <span className="font-display text-[1.1rem] font-black tabular-nums leading-none tracking-tight">
          {fmtMatchRating(display)}
        </span>
        <span className="text-[8px] font-extrabold uppercase tracking-wider opacity-85">/10</span>
      </div>
      {mode === "community" && aggregate && aggregate.count > 0 ? (
        <span className="text-[9px] font-semibold text-slate-500">{aggregate.count} hlasů</span>
      ) : null}
      {mode === "personal" && typeof jerseyRatingExport.myRatings[pid] !== "number" ? (
        <span className="text-[9px] font-semibold text-slate-400">Neuloženo</span>
      ) : null}
    </div>
  );
}

/**
 * Celá zápasová soupiska s dresy — layout jako {@link Nhl25SharePoster} (3 : 4, dvousloupec, Nhl25JerseyCard).
 */
export const MatchLineupFullJerseyExportPoster = forwardRef<HTMLDivElement, MatchLineupFullJerseyExportPosterProps>(
  function MatchLineupFullJerseyExportPoster(
    { lineupTitle, players, lineup, defenseCount, allowExtraForward, siteUrl = "", jerseyRatingExport },
    ref
  ) {
    const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
    const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) ?? null : null);
    const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const titleLine = lineupTitle.trim();

    const forwardLines = lineup.forwardLines.slice(0, 4);
    const compact = Boolean(jerseyRatingExport);

    const renderSlot = (pid: string | null, positionLabel: string, reactKey: string) => (
      <div key={reactKey} className={`${JERSEY_SLOT_MAX_W} flex min-w-0 flex-col gap-0 pb-0.5`}>
        <PosterJerseyWrap>
          <Nhl25JerseyCard
            player={getPlayer(pid)}
            positionLabel={positionLabel}
            size="compact"
            nameplateVariant="poster"
            ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
            disableMotion
          />
        </PosterJerseyWrap>
        {jerseyRatingExport && pid ? (
          <MatchJerseyRatingBadge pid={pid} jerseyRatingExport={jerseyRatingExport} />
        ) : null}
      </div>
    );

    const p3 = lineup.defensePairs[3];
    const seventhDefenseId = defenseCount === 7 ? (p3?.lb ?? null) : null;

    return (
      <div
        ref={ref}
        data-export-slot="cele-dresy"
        data-poster-surface="light"
        className={`${styles.root} match-lineup-full-jersey-poster nhl25-share-poster-capture ${styles.poster}`}
        style={SHARE_POSTER_3X4_STYLE}
      >
        <div className={styles.bg} aria-hidden />
        <div className={styles.topAccent} aria-hidden />

        <header className={styles.header}>
          <p className={styles.headerEyebrow}>{jerseyRatingExport ? "Hodnocení zápasu" : "Sestava na zápas"}</p>
          {titleLine ? <h1 className={`${styles.headerTitle} line-clamp-2`}>{titleLine}</h1> : null}
        </header>

        <div className={styles.layout}>
          <div className={styles.columns}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Brankáři</span>
                <span className={styles.sectionLine} aria-hidden />
              </div>
              <div className={styles.rows}>
                <div className={styles.grid2}>
                  {renderSlot(lineup.goalies[0], "G", "g1")}
                  {renderSlot(lineup.goalies[1], "G", "g2")}
                </div>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: 10 }}>
                <span className={styles.sectionLabel}>Útočné řady</span>
                <span className={styles.sectionLine} aria-hidden />
              </div>
              <div className={styles.rows}>
                {forwardLines.map((line, i) => (
                  <div key={`fl-${i}`} className={styles.rowBox}>
                    <div className={styles.rowTitle}>{i + 1}. lajna</div>
                    <div className={styles.grid3}>
                      {renderSlot(line.lw, "LW", `ln${i}-lw`)}
                      {renderSlot(line.c, "C", `ln${i}-c`)}
                      {renderSlot(line.rw, "RW", `ln${i}-rw`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Obranné páry</span>
                <span className={styles.sectionLine} aria-hidden />
              </div>
              <div className={styles.rows}>
                {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                  <div key={`pair-${i}`} className={styles.rowBox}>
                    <div className={styles.rowTitle}>{i + 1}. pár</div>
                    <div className={styles.grid2}>
                      {renderSlot(pair.lb, "LD", `pair-${i}-lb`)}
                      {renderSlot(pair.rb, "RD", `pair-${i}-rb`)}
                    </div>
                  </div>
                ))}
                {defenseCount === 8 && (p3?.lb || p3?.rb) ? (
                  <div className={styles.rowBox}>
                    <div className={styles.rowTitle}>4. pár</div>
                    <div className={styles.grid2}>
                      {renderSlot(p3.lb, "LD", "pair-4-lb")}
                      {renderSlot(p3.rb, "RD", "pair-4-rb")}
                    </div>
                  </div>
                ) : null}
                {seventhDefenseId ? (
                  <div className={styles.rowBox}>
                    <div className={styles.rowTitle}>7. bek</div>
                    <div className={styles.grid3}>
                      <div />
                      {renderSlot(seventhDefenseId, "D", "d7")}
                      <div />
                    </div>
                  </div>
                ) : null}
                {allowExtraForward && lineup.extraForwards[0] ? (
                  <div className={styles.rowBox}>
                    <div className={styles.rowTitle}>13. útočník</div>
                    <div className={styles.grid3}>
                      <div />
                      {renderSlot(lineup.extraForwards[0], "F", "xf")}
                      <div />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerTag}>{compact ? "Lineup export" : "Matchday graphic"}</div>
          <div className={styles.footerBrand}>{host || "hokejlineup.cz"}</div>
          <div className={styles.footerSide} aria-hidden />
        </footer>
      </div>
    );
  }
);
