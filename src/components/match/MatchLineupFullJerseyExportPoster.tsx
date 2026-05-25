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

    const heading = "border-slate-300 text-slate-900";
    const subheading = "text-slate-700";
    const lineBox = "border-slate-400/35 bg-white/[0.52]";
    const pairTitle = "text-slate-600";

    const forwardLines = lineup.forwardLines.slice(0, 4);
    const compact = Boolean(jerseyRatingExport);
    const sectionHeading = `mb-0.5 border-b pb-0.5 font-display text-[${compact ? "11px" : "13px"}] font-extrabold uppercase tracking-[0.12em] ${heading}`;

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
        className="match-lineup-full-jersey-poster nhl25-share-poster-capture relative flex shrink-0 flex-col overflow-hidden rounded-none border-0 bg-gradient-to-b from-white via-[#f4f6f9] to-[#e8ecf2] antialiased subpixel-antialiased shadow-[0_20px_50px_rgba(15,23,42,0.12)] [text-rendering:optimizeLegibility]"
        style={SHARE_POSTER_3X4_STYLE}
      >
        <div className="nhl25-moje-sestava-accent mx-2 mt-1.5 shrink-0 rounded-full sm:mx-2 sm:mt-2" aria-hidden />

        <header className="relative shrink-0 px-2 pb-0 pt-1.5 sm:px-2">
          <div className="min-w-0 text-center sm:text-left">
            {titleLine ? (
              <h1 className="line-clamp-2 font-display text-[1.42rem] font-extrabold leading-[1.06] tracking-tight text-slate-950 sm:text-[1.58rem]">
                {titleLine}
              </h1>
            ) : null}
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-visible px-2 pb-2 pt-0 sm:px-2">
          <div className={`grid min-h-0 flex-1 grid-cols-2 ${compact ? "gap-x-2" : "gap-x-3"}`}>
            <div className={`flex min-h-0 flex-col justify-between ${compact ? "gap-0.5" : "gap-1"}`}>
              <section className="shrink-0">
                <h2 className={sectionHeading}>Brankáři</h2>
                <div className="grid min-w-0 grid-cols-2 gap-x-3.5 gap-y-1 sm:gap-x-4">
                  {renderSlot(lineup.goalies[0], "G", "g1")}
                  {renderSlot(lineup.goalies[1], "G", "g2")}
                </div>
              </section>

              <section className="flex min-h-0 flex-1 flex-col justify-evenly gap-0.5">
                <h2 className={`${sectionHeading} shrink-0`}>Útočné řady</h2>
                <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-0.5">
                  {forwardLines.map((line, i) => (
                    <div
                      key={`fl-${i}`}
                      className={`flex min-w-0 flex-col gap-0 overflow-visible rounded-lg border px-1 py-0.5 ${lineBox}`}
                    >
                      <span
                        className={`shrink-0 font-display text-[12px] font-bold uppercase tracking-wide sm:text-[13px] ${subheading}`}
                      >
                        {i + 1}. lajna
                      </span>
                      <div className="grid min-w-0 w-full grid-cols-3 gap-x-3.5 gap-y-0 sm:gap-x-4">
                        {renderSlot(line.lw, "LW", `ln${i}-lw`)}
                        {renderSlot(line.c, "C", `ln${i}-c`)}
                        {renderSlot(line.rw, "RW", `ln${i}-rw`)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className={`flex min-h-0 flex-col justify-between ${compact ? "gap-0.5" : "gap-1"}`}>
              <section className="flex min-h-0 flex-1 flex-col justify-evenly gap-0.5">
                <h2 className={`${sectionHeading} shrink-0`}>Obranné páry</h2>
                <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-0.5">
                  {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                    <div key={`pair-${i}`} className={`min-w-0 rounded-lg border px-1 py-0.5 ${lineBox}`}>
                      <p
                        className={`mb-0.5 text-center font-display text-[12px] font-extrabold uppercase tracking-[0.1em] sm:text-[13px] ${pairTitle}`}
                      >
                        {i + 1}. pár
                      </p>
                      <div className="grid min-w-0 w-full grid-cols-2 gap-x-3.5 gap-y-0 sm:gap-x-4">
                        {renderSlot(pair.lb, "LD", `pair-${i}-lb`)}
                        {renderSlot(pair.rb, "RD", `pair-${i}-rb`)}
                      </div>
                    </div>
                  ))}
                  {defenseCount === 8 && (p3?.lb || p3?.rb) ? (
                    <div className={`min-w-0 rounded-lg border px-1 py-0.5 ${lineBox}`}>
                      <p
                        className={`mb-0.5 text-center font-display text-[12px] font-extrabold uppercase tracking-[0.1em] sm:text-[13px] ${pairTitle}`}
                      >
                        4. pár
                      </p>
                      <div className="grid min-w-0 w-full grid-cols-2 gap-x-3.5 gap-y-0 sm:gap-x-4">
                        {renderSlot(p3.lb, "LD", "pair-4-lb")}
                        {renderSlot(p3.rb, "RD", "pair-4-rb")}
                      </div>
                    </div>
                  ) : null}
                  {seventhDefenseId ? (
                    <div className={`min-w-0 rounded-lg border px-1 py-0.5 ${lineBox}`}>
                      <p
                        className={`mb-0.5 text-center font-display text-[12px] font-extrabold uppercase tracking-[0.1em] sm:text-[13px] ${pairTitle}`}
                      >
                        7. bek
                      </p>
                      <div className="grid grid-cols-3 gap-x-3.5">
                        <div className="col-start-2">{renderSlot(seventhDefenseId, "D", "d7")}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              {allowExtraForward && lineup.extraForwards[0] ? (
                <div className={`min-w-0 rounded-lg border px-1 py-0.5 ${lineBox}`}>
                  <p
                    className={`mb-0.5 text-center font-display text-[12px] font-extrabold uppercase tracking-[0.1em] sm:text-[13px] ${pairTitle}`}
                  >
                    13. útočník
                  </p>
                  <div className="grid grid-cols-3 gap-x-3.5">
                    <div className="col-start-2">{renderSlot(lineup.extraForwards[0], "F", "xf")}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <footer className="relative z-[2] mt-auto flex shrink-0 flex-col gap-1 border-t border-slate-200/90 bg-slate-100/95 px-2 py-2 sm:flex-row sm:items-end sm:justify-between sm:px-2 sm:py-2.5">
          <div className="max-w-[48%] text-left text-[12px] font-medium leading-snug text-slate-600">
            <p className="font-display text-[13px] font-extrabold leading-normal tracking-wide text-[#c8102e] sm:text-[14px]">
              {jerseyRatingExport ? "Hodnocení zápasu" : "Sestava na zápas"}
            </p>
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-[20px] font-black tracking-[0.12em] text-[#003087] sm:text-[22px]">
              {host || "hokejlineup.cz"}
            </p>
          </div>
          <div className="hidden w-[48%] sm:block" aria-hidden />
        </footer>
      </div>
    );
  }
);
