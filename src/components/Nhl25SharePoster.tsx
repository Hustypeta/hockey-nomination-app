"use client";

import { forwardRef, useMemo } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { Nhl25JerseyCard } from "@/components/sestava/Nhl25JerseyCard";

export interface Nhl25SharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  captainId: string | null;
  assistantIds?: string[];
  /** Zobrazená doména / URL ve footeru (např. window.location.host). */
  siteUrl?: string;
}

export const Nhl25SharePoster = forwardRef<HTMLDivElement, Nhl25SharePosterProps>(
  function Nhl25SharePoster({ players, lineup, captainId, assistantIds = [], siteUrl = "" }, ref) {
    const aids = assistantIds.length ? assistantIds : (lineup.assistantIds ?? []);
    const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) : null);

    const dateLabel = useMemo(
      () =>
        new Intl.DateTimeFormat("cs-CZ", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date()),
      []
    );

    const host = siteUrl.replace(/^https?:\/\//, "");

    return (
      <div
        ref={ref}
        className="nhl25-share-poster-capture w-[580px] shrink-0 overflow-hidden rounded-2xl border border-slate-300/90 bg-gradient-to-b from-white via-[#f4f6f9] to-[#e8ecf2] shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
      >
        <div className="nhl25-moje-sestava-accent mx-6 mt-4 rounded-full" aria-hidden />

        <header className="relative px-6 pb-3 pt-5 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div
              className="flex h-11 w-16 shrink-0 overflow-hidden rounded-md border border-slate-300/80 shadow-sm"
              aria-hidden
            >
              <span className="h-full w-1/3 bg-white" />
              <span className="h-full w-1/3 bg-[#c8102e]" />
              <span className="h-full w-1/3 bg-[#003087]" />
            </div>
            <h1 className="font-display text-left text-3xl font-bold leading-tight tracking-wide text-slate-900">
              Moje nominace na MS 2026 <span aria-hidden>🇨🇿</span>
            </h1>
          </div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-[#003087]/85">
            Český nároďák · soupiska
          </p>
        </header>

        <div className="relative mx-4 mb-4 rounded-xl border border-slate-200/90 bg-white/85 px-4 py-4 shadow-inner">
          <section className="mb-5">
            <h2 className="mb-3 border-b border-slate-200 pb-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-800">
              Brankáři
            </h2>
            <div className="grid grid-cols-3 gap-3">
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

          <section className="mb-5">
            <h2 className="mb-3 border-b border-slate-200 pb-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-800">
              Útočné řady
            </h2>
            <div className="space-y-4">
              {lineup.forwardLines.map((line, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200/70 bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-end sm:gap-4"
                >
                  <span className="shrink-0 font-display text-sm font-bold text-slate-700 sm:w-24">
                    {i + 1}. LAJNA
                  </span>
                  <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
                    <Nhl25JerseyCard
                      player={getPlayer(line.lw)}
                      positionLabel="LW"
                      size="skater"
                      isCaptain={line.lw ? captainId === line.lw : false}
                      isAssistant={line.lw ? aids.includes(line.lw) : false}
                      disableMotion
                    />
                    <Nhl25JerseyCard
                      player={getPlayer(line.c)}
                      positionLabel="C"
                      size="skater"
                      isCaptain={line.c ? captainId === line.c : false}
                      isAssistant={line.c ? aids.includes(line.c) : false}
                      disableMotion
                    />
                    <Nhl25JerseyCard
                      player={getPlayer(line.rw)}
                      positionLabel="RW"
                      size="skater"
                      isCaptain={line.rw ? captainId === line.rw : false}
                      isAssistant={line.rw ? aids.includes(line.rw) : false}
                      disableMotion
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-5">
            <h2 className="mb-3 border-b border-slate-200 pb-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-800">
              Obranné páry
            </h2>
            <div className="space-y-3">
              {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                <div key={i}>
                  <p className="mb-2 text-center font-display text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    {i + 1}. pár
                  </p>
                  <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
                    <Nhl25JerseyCard
                      player={getPlayer(pair.lb)}
                      positionLabel="LD"
                      size="skater"
                      isCaptain={pair.lb ? captainId === pair.lb : false}
                      isAssistant={pair.lb ? aids.includes(pair.lb) : false}
                      disableMotion
                    />
                    <Nhl25JerseyCard
                      player={getPlayer(pair.rb)}
                      positionLabel="RD"
                      size="skater"
                      isCaptain={pair.rb ? captainId === pair.rb : false}
                      isAssistant={pair.rb ? aids.includes(pair.rb) : false}
                      disableMotion
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/90 px-3 py-3">
              <p className="mb-2 text-center font-display text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                7. bek
              </p>
              <div className="mx-auto flex max-w-[9rem] justify-center">
                <Nhl25JerseyCard
                  player={getPlayer(lineup.defensePairs[3].lb)}
                  positionLabel="D"
                  size="skater"
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
            <h2 className="mb-3 border-b border-slate-200 pb-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-800">
              Doplněk soupisky
            </h2>
            <div className="grid grid-cols-4 gap-2">
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
              <div className="rounded-md border border-slate-200/80 bg-white/90 p-1.5">
                <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                  Náhr. F
                </p>
                <Nhl25JerseyCard
                  player={getPlayer(lineup.extraForwards[1] ?? null)}
                  positionLabel="F"
                  size="compact"
                  isCaptain={
                    lineup.extraForwards[1] ? captainId === lineup.extraForwards[1] : false
                  }
                  isAssistant={
                    lineup.extraForwards[1] ? aids.includes(lineup.extraForwards[1]) : false
                  }
                  disableMotion
                />
              </div>
              <div className="rounded-md border border-slate-200/80 bg-white/90 p-1.5">
                <p className="mb-1 text-center text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                  Náhr. D
                </p>
                <Nhl25JerseyCard
                  player={getPlayer(lineup.extraDefensemen[0] ?? null)}
                  positionLabel="D"
                  size="compact"
                  isCaptain={
                    lineup.extraDefensemen[0] ? captainId === lineup.extraDefensemen[0] : false
                  }
                  isAssistant={
                    lineup.extraDefensemen[0] ? aids.includes(lineup.extraDefensemen[0]) : false
                  }
                  disableMotion
                />
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-slate-200/90 bg-slate-100/80 px-6 py-4 text-center">
          <p className="text-[11px] font-medium text-slate-600">Sestaveno {dateLabel}</p>
          {host ? (
            <p className="mt-1 font-display text-xs tracking-wide text-[#003087]/90">{host}</p>
          ) : null}
        </footer>
      </div>
    );
  }
);
