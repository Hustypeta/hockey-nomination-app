"use client";

import { forwardRef, useLayoutEffect, useState } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { Nhl25JerseyCard } from "@/components/sestava/Nhl25JerseyCard";
import { CzechFlagMark } from "@/components/CzechFlagMark";

export interface Nhl25SharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  captainId: string | null;
  assistantIds?: string[];
  /** Zobrazená doména / URL ve footeru (např. window.location.host). */
  siteUrl?: string;
  /**
   * ISO čas pro řádek „Sestaveno …“ (nastav před capture přes flushSync).
   * Bez něj se použije datum z prvního vykreslení klienta.
   */
  footerInstantIso?: string | null;
}

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

export const Nhl25SharePoster = forwardRef<HTMLDivElement, Nhl25SharePosterProps>(
  function Nhl25SharePoster(
    { players, lineup, captainId, assistantIds = [], siteUrl = "", footerInstantIso = null },
    ref
  ) {
    const aids = assistantIds.length ? assistantIds : (lineup.assistantIds ?? []);
    const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) ?? null : null);

    const [mountedDateLabel, setMountedDateLabel] = useState("");
    useLayoutEffect(() => {
      setMountedDateLabel(formatCsDate(new Date()));
    }, []);

    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;

    const host = siteUrl.replace(/^https?:\/\//, "");
    const extraD = lineup.extraDefensemen[0] ?? null;

    return (
      <div
        ref={ref}
        className="nhl25-share-poster-capture w-[920px] max-w-[920px] shrink-0 overflow-hidden rounded-2xl border border-slate-300/90 bg-gradient-to-b from-white via-[#f4f6f9] to-[#e8ecf2] shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
      >
        <div className="nhl25-moje-sestava-accent mx-8 mt-5 rounded-full" aria-hidden />

        <header className="relative px-8 pb-2 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between sm:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <CzechFlagMark className="h-12 w-[4rem] shrink-0 rounded-md border border-slate-300/80 shadow-sm" />
              <div className="min-w-0 text-left">
                <h1 className="font-display text-[1.65rem] font-bold leading-tight tracking-wide text-slate-900 sm:text-3xl">
                  Moje nominace na MS 2026 <span aria-hidden>🇨🇿</span>
                </h1>
                <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-[#003087]/85">
                  Český nároďák · soupiska
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="relative mx-6 mb-5 mt-3 rounded-xl border border-slate-200/90 bg-white/90 px-5 py-5 shadow-inner">
          {/* Vždy 2 sloupce — šířka plakátu je 920px &lt; Tailwind lg, jinak by zůstal jeden sloupec. */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sloupec: útok + brankáři (jako na „ledové“ straně) */}
            <div className="min-w-0 space-y-5">
              <section>
                <h2 className="mb-2.5 border-b border-slate-200 pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
                  Brankáři
                </h2>
                <div className="grid grid-cols-3 gap-2.5">
                  {lineup.goalies.map((gid, i) => (
                    <Nhl25JerseyCard
                      key={`g-${i}`}
                      player={getPlayer(gid)}
                      positionLabel="G"
                      size="goalie"
                      isCaptain={gid ? captainId === gid : false}
                      isAssistant={gid ? aids.includes(gid) : false}
                      disableMotion
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-2.5 border-b border-slate-200 pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
                  Útočné řady
                </h2>
                <div className="space-y-2.5">
                  {lineup.forwardLines.map((line, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-lg border border-slate-200/70 bg-slate-50/90 px-2.5 py-2.5 sm:flex-row sm:items-end sm:gap-3"
                    >
                      <span className="w-full shrink-0 font-display text-[11px] font-bold text-slate-600 sm:w-[4.5rem]">
                        {i + 1}. LAJNA
                      </span>
                      <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5">
                        <Nhl25JerseyCard
                          player={getPlayer(line.lw)}
                          positionLabel="LW"
                          size="compact"
                          isCaptain={line.lw ? captainId === line.lw : false}
                          isAssistant={line.lw ? aids.includes(line.lw) : false}
                          disableMotion
                        />
                        <Nhl25JerseyCard
                          player={getPlayer(line.c)}
                          positionLabel="C"
                          size="compact"
                          isCaptain={line.c ? captainId === line.c : false}
                          isAssistant={line.c ? aids.includes(line.c) : false}
                          disableMotion
                        />
                        <Nhl25JerseyCard
                          player={getPlayer(line.rw)}
                          positionLabel="RW"
                          size="compact"
                          isCaptain={line.rw ? captainId === line.rw : false}
                          isAssistant={line.rw ? aids.includes(line.rw) : false}
                          disableMotion
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sloupec: obrana + doplněk */}
            <div className="min-w-0 space-y-5">
              <section>
                <h2 className="mb-2.5 border-b border-slate-200 pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
                  Obranné páry
                </h2>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200/70 bg-slate-50/90 px-2 py-2.5"
                    >
                      <p className="mb-1.5 text-center font-display text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {i + 1}. pár
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Nhl25JerseyCard
                          player={getPlayer(pair.lb)}
                          positionLabel="LD"
                          size="compact"
                          isCaptain={pair.lb ? captainId === pair.lb : false}
                          isAssistant={pair.lb ? aids.includes(pair.lb) : false}
                          disableMotion
                        />
                        <Nhl25JerseyCard
                          player={getPlayer(pair.rb)}
                          positionLabel="RD"
                          size="compact"
                          isCaptain={pair.rb ? captainId === pair.rb : false}
                          isAssistant={pair.rb ? aids.includes(pair.rb) : false}
                          disableMotion
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/90 px-2 py-2">
                  <p className="mb-1.5 text-center font-display text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    7. bek
                  </p>
                  <div className="mx-auto flex max-w-[6.5rem] justify-center">
                    <Nhl25JerseyCard
                      player={getPlayer(lineup.defensePairs[3].lb)}
                      positionLabel="D"
                      size="compact"
                      isCaptain={
                        lineup.defensePairs[3].lb ? captainId === lineup.defensePairs[3].lb : false
                      }
                      isAssistant={
                        lineup.defensePairs[3].lb ? aids.includes(lineup.defensePairs[3].lb) : false
                      }
                      disableMotion
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-2.5 border-b border-slate-200 pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
                  Doplněk soupisky
                </h2>
                <div
                  className={`grid gap-2 ${extraD ? "grid-cols-3" : "grid-cols-2"}`}
                >
                  <div className="rounded-md border border-slate-200/80 bg-white/90 p-1.5">
                    <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                      13. útok
                    </p>
                    <Nhl25JerseyCard
                      player={getPlayer(lineup.forwardLines[3].x)}
                      positionLabel="X"
                      size="compact"
                      isCaptain={
                        lineup.forwardLines[3].x ? captainId === lineup.forwardLines[3].x : false
                      }
                      isAssistant={
                        lineup.forwardLines[3].x ? aids.includes(lineup.forwardLines[3].x) : false
                      }
                      disableMotion
                    />
                  </div>
                  <div className="rounded-md border border-slate-200/80 bg-white/90 p-1.5">
                    <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                      Náhr. F
                    </p>
                    <Nhl25JerseyCard
                      player={getPlayer(lineup.extraForwards[0] ?? null)}
                      positionLabel="F"
                      size="compact"
                      isCaptain={
                        lineup.extraForwards[0] ? captainId === lineup.extraForwards[0] : false
                      }
                      isAssistant={
                        lineup.extraForwards[0] ? aids.includes(lineup.extraForwards[0]) : false
                      }
                      disableMotion
                    />
                  </div>
                  {extraD ? (
                    <div className="rounded-md border border-slate-200/80 bg-white/90 p-1.5">
                      <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                        Náhr. D
                      </p>
                      <Nhl25JerseyCard
                        player={getPlayer(extraD)}
                        positionLabel="D"
                        size="compact"
                        isCaptain={captainId === extraD}
                        isAssistant={aids.includes(extraD)}
                        disableMotion
                      />
                    </div>
                  ) : null}
                </div>
                {!extraD ? (
                  <p className="mt-2 text-center text-[9px] leading-snug text-slate-500">
                    Sedmý bek je v řádku výše — slot náhradního obránce zůstává volný, dokud ho nevyplníš ve
                    sestavě.
                  </p>
                ) : null}
              </section>
            </div>
          </div>
        </div>

        <footer className="border-t border-slate-200/90 bg-slate-100/80 px-8 py-3.5 text-center">
          <p className="text-[11px] font-medium text-slate-600">
            {dateLabel ? `Sestaveno ${dateLabel}` : "Sestaveno"}
          </p>
          {host ? (
            <p className="mt-1 font-display text-xs tracking-wide text-[#003087]/90">{host}</p>
          ) : null}
        </footer>
      </div>
    );
  }
);
