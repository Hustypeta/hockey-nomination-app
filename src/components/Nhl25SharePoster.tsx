"use client";

import { forwardRef, useLayoutEffect, useMemo, useState } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { Nhl25JerseyCard } from "@/components/sestava/Nhl25JerseyCard";

export interface Nhl25SharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  captainId: string | null;
  assistantIds?: string[];
  /** Vlastní název nominace (editor / účet) — zobrazí se v záhlaví plakátu. */
  nominationTitle?: string | null;
  /** Zobrazená doména / URL ve footeru (např. window.location.host). */
  siteUrl?: string;
  /**
   * ISO čas pro řádek „Sestaveno …“ (nastav před capture přes flushSync).
   * Bez něj se použije datum z prvního vykreslení klienta.
   */
  footerInstantIso?: string | null;
  /** Světlý export (výchozí) vs. tmavý vhodný pro sociální sítě. */
  posterTheme?: "light" | "dark";
  /** Jméno nebo přezdívka ve watermarku (přihlášený uživatel). */
  watermarkUserLabel?: string | null;
}

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

export const Nhl25SharePoster = forwardRef<HTMLDivElement, Nhl25SharePosterProps>(
  function Nhl25SharePoster(
    {
      players,
      lineup: lineupProp,
      captainId,
      assistantIds = [],
      nominationTitle = null,
      siteUrl = "",
      footerInstantIso = null,
      posterTheme = "light",
      watermarkUserLabel = null,
    },
    ref
  ) {
    const dark = posterTheme === "dark";
    const lineup = useMemo(() => normalizeLineupStructure(lineupProp), [lineupProp]);
    const aids = assistantIds.length ? assistantIds : (lineup.assistantIds ?? []);
    const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) ?? null : null);

    const [mountedDateLabel, setMountedDateLabel] = useState("");
    useLayoutEffect(() => {
      setMountedDateLabel(formatCsDate(new Date()));
    }, []);

    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;

    const host = siteUrl.replace(/^https?:\/\//, "");
    const extraD = lineup.extraDefensemen[0] ?? null;
    const seventhDefenseId = lineup.defensePairs[3].lb ?? lineup.extraDefensemen[0] ?? null;
    const titleLine = nominationTitle?.trim() ?? "";
    const wm = watermarkUserLabel?.trim() ?? "";

    const shell = dark
      ? "border-white/10 bg-gradient-to-b from-[#0f141c] via-[#0a0d12] to-[#050608] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
      : "border-slate-300/90 bg-gradient-to-b from-white via-[#f4f6f9] to-[#e8ecf2] shadow-[0_20px_50px_rgba(15,23,42,0.12)]";
    const panel = dark
      ? "border-white/10 bg-[#12151f]/95 shadow-inner"
      : "border-slate-200/90 bg-white/90 shadow-inner";
    const heading = dark ? "border-white/10 text-white" : "border-slate-200 text-slate-800";
    const subheading = dark ? "text-white/55" : "text-slate-600";
    const lineBox = dark ? "border-white/10 bg-[#0f1218]/90" : "border-slate-200/70 bg-slate-50/90";
    const pairTitle = dark ? "text-white/45" : "text-slate-500";

    return (
      <div
        ref={ref}
        className={`nhl25-share-poster-capture relative w-[920px] max-w-[920px] shrink-0 overflow-hidden rounded-2xl border ${shell}`}
      >
        <div className="nhl25-moje-sestava-accent mx-8 mt-5 rounded-full" aria-hidden />

        <header className="relative px-8 pb-2 pt-6">
          <div className="min-w-0 text-center sm:text-left">
            <h1
              className={`font-display text-[1.65rem] font-bold leading-tight tracking-wide sm:text-3xl ${dark ? "text-white" : "text-slate-900"}`}
            >
              Moje nominace na MS 2026
            </h1>
            {titleLine ? (
              <p className="mt-2 line-clamp-2 font-display text-[1.05rem] font-semibold leading-snug tracking-wide text-[#5ab0ff] sm:text-xl">
                {titleLine}
              </p>
            ) : null}
            <p
              className={`font-display text-[11px] font-semibold uppercase tracking-[0.22em] ${dark ? "text-sky-300/85" : "text-[#003087]/85"} ${titleLine ? "mt-1.5" : "mt-1"}`}
            >
              Český nároďák · soupiska
            </p>
          </div>
        </header>

        <div className={`relative mx-6 mb-5 mt-3 rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${panel}`}>
          {/* Dva sloupce; doplněk soupisky je pod mřížkou přes celou šířku */}
          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {/* Sloupec: útok + brankáři (jako na „ledové“ straně) */}
            <div className="min-w-0 space-y-4">
              <section>
                <h2 className={`mb-2.5 border-b pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] ${heading}`}>
                  Brankáři
                </h2>
                <div className="grid min-w-0 grid-cols-3 gap-2">
                  {lineup.goalies.map((gid, i) => (
                    <Nhl25JerseyCard
                      key={`g-${i}`}
                      player={getPlayer(gid)}
                      positionLabel="G"
                      size="compact"
                      isCaptain={gid ? captainId === gid : false}
                      isAssistant={gid ? aids.includes(gid) : false}
                      disableMotion
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className={`mb-2.5 border-b pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] ${heading}`}>
                  Útočné řady
                </h2>
                <div className="space-y-2">
                  {lineup.forwardLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex min-w-0 flex-col gap-1.5 rounded-lg border px-2 py-2 sm:px-2.5 sm:py-2.5 ${lineBox}`}
                    >
                      <span className={`shrink-0 font-display text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${subheading}`}>
                        {i + 1}. lajna
                      </span>
                      <div className="grid min-w-0 w-full grid-cols-3 gap-2">
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

            {/* Sloupec: obrana (vč. 7. beka v mřížce) */}
            <div className="min-w-0 space-y-4">
              <section>
                <h2 className={`mb-2 border-b pb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] ${heading}`}>
                  Obranné páry
                </h2>
                <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-2.5">
                  {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                    <div
                      key={i}
                      className={`min-w-0 rounded-lg border px-1.5 py-2 sm:px-2 sm:py-2.5 ${lineBox}`}
                    >
                      <p className={`mb-1 text-center font-display text-[9px] font-bold uppercase tracking-[0.18em] ${pairTitle}`}>
                        {i + 1}. pár
                      </p>
                      <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:gap-2">
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
                      <div
                        className="mx-auto mt-2 h-1 w-[92%] rounded-full bg-gradient-to-r from-transparent via-[#003087] to-transparent opacity-95 shadow-[0_0_14px_rgba(0,48,135,0.45)]"
                        aria-hidden
                      />
                    </div>
                  ))}
                  <div className={`min-w-0 rounded-lg border px-1.5 py-2 sm:px-2 sm:py-2.5 ${lineBox}`}>
                    <p className={`mb-1 text-center font-display text-[9px] font-bold uppercase tracking-[0.18em] ${pairTitle}`}>
                      7. bek
                    </p>
                    <div className="flex justify-center">
                      <Nhl25JerseyCard
                        player={getPlayer(seventhDefenseId)}
                        positionLabel="D"
                        size="compact"
                        isCaptain={seventhDefenseId ? captainId === seventhDefenseId : false}
                        isAssistant={seventhDefenseId ? aids.includes(seventhDefenseId) : false}
                        disableMotion
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section
            className={`mt-5 border-t border-dashed pt-5 sm:mt-6 sm:pt-6 ${dark ? "border-white/15" : "border-slate-300/60"}`}
          >
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2
                className={`font-display text-sm font-bold uppercase tracking-[0.18em] sm:text-base ${dark ? "text-white" : "text-slate-900"}`}
              >
                Doplněk soupisky
              </h2>
              <p className={`text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${subheading}`}>
                13. útok · náhradníci
              </p>
            </div>
            <div className={`grid min-w-0 gap-3 sm:gap-4 ${extraD ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
              <div className={`min-w-0 rounded-lg border p-2 sm:p-3 ${dark ? "border-white/12 bg-[#0f1218]/95" : "border-slate-200/90 bg-white/95"}`}>
                <p className={`mb-2 text-center text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${subheading}`}>
                  13. útok (X)
                </p>
                <div className="flex justify-center">
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
              </div>
              <div className={`min-w-0 rounded-lg border p-2 sm:p-3 ${dark ? "border-white/12 bg-[#0f1218]/95" : "border-slate-200/90 bg-white/95"}`}>
                <p className={`mb-2 text-center text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${subheading}`}>
                  Náhradní útočník
                </p>
                <div className="flex justify-center">
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
              </div>
              {extraD ? (
                <div className={`min-w-0 rounded-lg border p-2 sm:p-3 ${dark ? "border-white/12 bg-[#0f1218]/95" : "border-slate-200/90 bg-white/95"}`}>
                  <p className={`mb-2 text-center text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${subheading}`}>
                    Náhradní obránce
                  </p>
                  <div className="flex justify-center">
                    <Nhl25JerseyCard
                      player={getPlayer(extraD)}
                      positionLabel="D"
                      size="compact"
                      isCaptain={captainId === extraD}
                      isAssistant={aids.includes(extraD)}
                      disableMotion
                    />
                  </div>
                </div>
              ) : null}
            </div>
            {!extraD ? (
              <p className={`mt-3 text-center text-[10px] leading-snug sm:text-[11px] ${subheading}`}>
                Na soupisce MS je i osmý bek v náhradnících — v editoru ho doplň po sedmém bekovi v obraně.
              </p>
            ) : null}
          </section>
        </div>

        <footer
          className={`flex flex-col gap-2 border-t px-6 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:px-8 ${
            dark ? "border-white/10 bg-black/35" : "border-slate-200/90 bg-slate-100/80"
          }`}
        >
          <div className={`max-w-[48%] text-left text-[9px] leading-snug sm:text-[10px] ${dark ? "text-white/45" : "text-slate-500"}`}>
            <p className="font-display font-bold tracking-wide text-[#c8102e]">LineUp 2026</p>
            {wm ? <p className="mt-0.5 font-medium text-white/70">{wm}</p> : null}
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className={`text-[11px] font-medium ${dark ? "text-white/75" : "text-slate-600"}`}>
              {dateLabel ? `Sestaveno ${dateLabel}` : "Sestaveno"}
            </p>
            {host ? (
              <p className={`mt-1 font-display text-xs tracking-wide ${dark ? "text-sky-300/90" : "text-[#003087]/90"}`}>
                {host}
              </p>
            ) : null}
          </div>
          <div className="hidden w-[48%] sm:block" aria-hidden />
        </footer>
      </div>
    );
  }
);
