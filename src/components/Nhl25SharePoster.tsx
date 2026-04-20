"use client";

import { forwardRef, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
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

/** Na plakátu stejná šířka dresu v mřížce 2/3 sloupců (obrana působila menší). */
function PosterJerseyWrap({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-[6.5rem] min-[400px]:w-[7rem] sm:w-[7.25rem]">{children}</div>;
}

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

        <div className={`relative mx-5 mb-4 mt-2 rounded-xl border px-3 py-3 sm:mx-6 sm:mb-5 sm:mt-3 sm:px-4 sm:py-4 ${panel}`}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <div className="min-w-0 space-y-3 sm:space-y-3.5">
              <section>
                <h2 className={`mb-2 border-b pb-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] sm:mb-2.5 sm:pb-1.5 sm:text-[11px] ${heading}`}>
                  Brankáři
                </h2>
                <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
                  {lineup.goalies.map((gid, i) => (
                    <PosterJerseyWrap key={`g-${i}`}>
                      <Nhl25JerseyCard
                        player={getPlayer(gid)}
                        positionLabel="G"
                        size="compact"
                        nameplateVariant="poster"
                        isCaptain={gid ? captainId === gid : false}
                        isAssistant={gid ? aids.includes(gid) : false}
                        disableMotion
                      />
                    </PosterJerseyWrap>
                  ))}
                </div>
              </section>

              <section>
                <h2 className={`mb-2 border-b pb-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] sm:mb-2.5 sm:pb-1.5 sm:text-[11px] ${heading}`}>
                  Útočné řady
                </h2>
                <div className="space-y-1.5 sm:space-y-2">
                  {lineup.forwardLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex min-w-0 flex-col gap-1 rounded-lg border px-1.5 py-1.5 sm:gap-1.5 sm:px-2 sm:py-2 ${lineBox}`}
                    >
                      <span className={`shrink-0 font-display text-[9px] font-bold uppercase tracking-wide sm:text-[11px] ${subheading}`}>
                        {i + 1}. lajna
                      </span>
                      <div className="grid min-w-0 w-full grid-cols-3 gap-1 sm:gap-2">
                        <PosterJerseyWrap>
                          <Nhl25JerseyCard
                            player={getPlayer(line.lw)}
                            positionLabel="LW"
                            size="compact"
                            nameplateVariant="poster"
                            isCaptain={line.lw ? captainId === line.lw : false}
                            isAssistant={line.lw ? aids.includes(line.lw) : false}
                            disableMotion
                          />
                        </PosterJerseyWrap>
                        <PosterJerseyWrap>
                          <Nhl25JerseyCard
                            player={getPlayer(line.c)}
                            positionLabel="C"
                            size="compact"
                            nameplateVariant="poster"
                            isCaptain={line.c ? captainId === line.c : false}
                            isAssistant={line.c ? aids.includes(line.c) : false}
                            disableMotion
                          />
                        </PosterJerseyWrap>
                        <PosterJerseyWrap>
                          <Nhl25JerseyCard
                            player={getPlayer(line.rw)}
                            positionLabel="RW"
                            size="compact"
                            nameplateVariant="poster"
                            isCaptain={line.rw ? captainId === line.rw : false}
                            isAssistant={line.rw ? aids.includes(line.rw) : false}
                            disableMotion
                          />
                        </PosterJerseyWrap>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`rounded-lg border border-dashed px-2 py-2 sm:px-2.5 sm:py-2.5 ${dark ? "border-white/18 bg-black/15" : "border-slate-300/70 bg-slate-50/80"}`}>
                <h2
                  className={`mb-2 text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] ${dark ? "text-white/90" : "text-slate-800"}`}
                >
                  Doplněk soupisky
                </h2>
                <p className={`mb-2 text-center text-[9px] font-semibold uppercase tracking-wider ${subheading}`}>
                  13. útok · náhradníci
                </p>
                <div className={`grid min-w-0 gap-2 ${extraD ? "grid-cols-3" : "grid-cols-2"}`}>
                  <div className="min-w-0">
                    <p className={`mb-1 text-center text-[8px] font-bold uppercase tracking-wider sm:text-[10px] ${subheading}`}>
                      X
                    </p>
                    <PosterJerseyWrap>
                      <Nhl25JerseyCard
                        player={getPlayer(lineup.forwardLines[3].x)}
                        positionLabel="X"
                        size="compact"
                        nameplateVariant="poster"
                        isCaptain={
                          lineup.forwardLines[3].x ? captainId === lineup.forwardLines[3].x : false
                        }
                        isAssistant={
                          lineup.forwardLines[3].x ? aids.includes(lineup.forwardLines[3].x) : false
                        }
                        disableMotion
                      />
                    </PosterJerseyWrap>
                  </div>
                  <div className="min-w-0">
                    <p className={`mb-1 text-center text-[8px] font-bold uppercase tracking-wider sm:text-[10px] ${subheading}`}>
                      náhr. F
                    </p>
                    <PosterJerseyWrap>
                      <Nhl25JerseyCard
                        player={getPlayer(lineup.extraForwards[0] ?? null)}
                        positionLabel="F"
                        size="compact"
                        nameplateVariant="poster"
                        isCaptain={
                          lineup.extraForwards[0] ? captainId === lineup.extraForwards[0] : false
                        }
                        isAssistant={
                          lineup.extraForwards[0] ? aids.includes(lineup.extraForwards[0]) : false
                        }
                        disableMotion
                      />
                    </PosterJerseyWrap>
                  </div>
                  {extraD ? (
                    <div className="min-w-0">
                      <p className={`mb-1 text-center text-[8px] font-bold uppercase tracking-wider sm:text-[10px] ${subheading}`}>
                        náhr. D
                      </p>
                      <PosterJerseyWrap>
                        <Nhl25JerseyCard
                          player={getPlayer(extraD)}
                          positionLabel="D"
                          size="compact"
                          nameplateVariant="poster"
                          isCaptain={captainId === extraD}
                          isAssistant={aids.includes(extraD)}
                          disableMotion
                        />
                      </PosterJerseyWrap>
                    </div>
                  ) : null}
                </div>
                {!extraD ? (
                  <p className={`mt-2 text-center text-[8px] leading-snug sm:text-[10px] ${subheading}`}>
                    Osmého beka doplň v editoru pod 7. bekem.
                  </p>
                ) : null}
              </section>
            </div>

            <div className="min-w-0 space-y-3 sm:space-y-4">
              <section>
                <h2 className={`mb-2 border-b pb-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px] ${heading}`}>
                  Obranné páry
                </h2>
                <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:gap-2">
                  {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                    <div key={i} className={`min-w-0 rounded-lg border px-1 py-1.5 sm:px-1.5 sm:py-2 ${lineBox}`}>
                      <p className={`mb-1 text-center font-display text-[8px] font-bold uppercase tracking-[0.18em] sm:text-[9px] ${pairTitle}`}>
                        {i + 1}. pár
                      </p>
                      <div className="grid min-w-0 grid-cols-2 gap-1 sm:gap-1.5">
                        <PosterJerseyWrap>
                          <Nhl25JerseyCard
                            player={getPlayer(pair.lb)}
                            positionLabel="LD"
                            size="compact"
                            nameplateVariant="poster"
                            isCaptain={pair.lb ? captainId === pair.lb : false}
                            isAssistant={pair.lb ? aids.includes(pair.lb) : false}
                            disableMotion
                          />
                        </PosterJerseyWrap>
                        <PosterJerseyWrap>
                          <Nhl25JerseyCard
                            player={getPlayer(pair.rb)}
                            positionLabel="RD"
                            size="compact"
                            nameplateVariant="poster"
                            isCaptain={pair.rb ? captainId === pair.rb : false}
                            isAssistant={pair.rb ? aids.includes(pair.rb) : false}
                            disableMotion
                          />
                        </PosterJerseyWrap>
                      </div>
                      <div
                        className="mx-auto mt-1.5 h-0.5 w-[88%] rounded-full bg-gradient-to-r from-transparent via-[#003087] to-transparent opacity-95 shadow-[0_0_10px_rgba(0,48,135,0.4)] sm:mt-2 sm:h-1"
                        aria-hidden
                      />
                    </div>
                  ))}
                  <div className={`min-w-0 rounded-lg border px-1 py-1.5 sm:px-1.5 sm:py-2 ${lineBox}`}>
                    <p className={`mb-1 text-center font-display text-[8px] font-bold uppercase tracking-[0.18em] sm:text-[9px] ${pairTitle}`}>
                      7. bek
                    </p>
                    <PosterJerseyWrap>
                      <Nhl25JerseyCard
                        player={getPlayer(seventhDefenseId)}
                        positionLabel="D"
                        size="compact"
                        nameplateVariant="poster"
                        isCaptain={seventhDefenseId ? captainId === seventhDefenseId : false}
                        isAssistant={seventhDefenseId ? aids.includes(seventhDefenseId) : false}
                        disableMotion
                      />
                    </PosterJerseyWrap>
                  </div>
                </div>
              </section>
            </div>
          </div>
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
