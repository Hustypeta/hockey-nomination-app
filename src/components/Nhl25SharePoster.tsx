"use client";

import { forwardRef, useMemo, useState, type ReactNode } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";
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

/** Dres na plakátu — jednotlivé sloty co největší (priorita čitelnost příjmení). */
function PosterJerseyWrap({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[10.25rem] min-[420px]:w-[10.65rem] sm:w-[11rem]">{children}</div>
  );
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

    const [mountedDateLabel] = useState(() => formatCsDate(new Date()));

    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;

    const host = siteUrl.replace(/^https?:\/\//, "");
    const extraD = lineup.extraDefensemen[0] ?? null;
    const seventhDefenseId = lineup.defensePairs[3].lb ?? lineup.extraDefensemen[0] ?? null;
    const titleLine = nominationTitle?.trim() ?? "";
    const wm = watermarkUserLabel?.trim() ?? "";

    const shell = dark
      ? "border-white/10 bg-gradient-to-b from-[#0f141c] via-[#0a0d12] to-[#050608] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
      : "border-slate-300/90 bg-gradient-to-b from-white via-[#f4f6f9] to-[#e8ecf2] shadow-[0_20px_50px_rgba(15,23,42,0.12)]";
    /** Bez velkého „bílého rámečku“ — jen siluety, více místa pro dresy (export / IG). */
    const innerChrome =
      dark ? "border-0 bg-transparent shadow-none" : "border-0 bg-transparent shadow-none";
    const heading = dark ? "border-white/10 text-white" : "border-slate-200 text-slate-800";
    const subheading = dark ? "text-white/55" : "text-slate-600";
    const lineBox =
      dark ? "border-white/[0.14] bg-black/[0.28]" : "border-slate-400/35 bg-white/[0.52]";
    const pairTitle = dark ? "text-white/45" : "text-slate-500";

    return (
      <div
        ref={ref}
        className={`nhl25-share-poster-capture relative shrink-0 overflow-hidden rounded-2xl border antialiased [text-rendering:optimizeLegibility] ${shell}`}
        style={{ width: SHARE_POSTER_WIDTH_PX, maxWidth: SHARE_POSTER_WIDTH_PX }}
      >
        <div className="nhl25-moje-sestava-accent mx-8 mt-5 rounded-full" aria-hidden />

        <header className="relative px-6 pb-1 pt-4 sm:px-8">
          <div className="min-w-0 text-center sm:text-left">
            {titleLine ? (
              <h1
                className={`line-clamp-3 font-display text-[1.65rem] font-bold leading-tight tracking-wide sm:text-3xl ${dark ? "text-white" : "text-slate-900"}`}
              >
                {titleLine}
              </h1>
            ) : null}
            <p
              className={`font-display text-[12px] font-semibold uppercase tracking-[0.22em] sm:text-[13px] ${dark ? "text-sky-300/85" : "text-[#003087]/85"} ${titleLine ? "mt-2" : ""}`}
            >
              Český nároďák · soupiska
            </p>
          </div>
        </header>

        <div className={`relative mx-2 mb-3 mt-1 px-1 py-1 sm:mx-4 sm:mb-4 ${innerChrome}`}>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <div className="min-w-0 space-y-3 sm:space-y-3.5">
              <section>
                <h2 className={`mb-2 border-b pb-1 font-display text-[12px] font-bold uppercase tracking-[0.2em] sm:mb-2.5 sm:pb-1.5 sm:text-[13px] ${heading}`}>
                  Brankáři
                </h2>
                <div className="grid min-w-0 grid-cols-3 gap-1 sm:gap-1.5">
                  {lineup.goalies.map((gid, i) => (
                    <div key={`g-${i}`} className="flex min-w-0 flex-col gap-1">
                      <span className={`shrink-0 text-center font-display text-[11px] font-bold uppercase tracking-wide sm:text-[12px] ${subheading}`}>
                        {i + 1}. golman
                      </span>
                      <PosterJerseyWrap>
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
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className={`mb-2 border-b pb-1 font-display text-[12px] font-bold uppercase tracking-[0.2em] sm:mb-2.5 sm:pb-1.5 sm:text-[13px] ${heading}`}>
                  Útočné řady
                </h2>
                <div className="space-y-1.5 sm:space-y-2">
                  {lineup.forwardLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex min-w-0 flex-col gap-1 rounded-lg border px-1.5 py-1.5 sm:gap-1.5 sm:px-2 sm:py-2 ${lineBox}`}
                    >
                      <span className={`shrink-0 font-display text-[11px] font-bold uppercase tracking-wide sm:text-[12px] ${subheading}`}>
                        {i + 1}. lajna
                      </span>
                      <div className="grid min-w-0 w-full grid-cols-3 gap-1 sm:gap-1.5">
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
            </div>

            <div className="min-w-0 space-y-3 sm:space-y-4">
              <section>
                <h2 className={`mb-2 border-b pb-1 font-display text-[12px] font-bold uppercase tracking-[0.2em] sm:text-[13px] ${heading}`}>
                  Obranné páry
                </h2>
                <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5">
                  {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                    <div key={i} className={`min-w-0 rounded-lg border px-1.5 py-1.5 sm:px-2 sm:py-2 ${lineBox}`}>
                      <p className={`mb-1 text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] ${pairTitle}`}>
                        {i + 1}. pár
                      </p>
                      <div className="mx-auto grid min-w-0 max-w-[22.5rem] grid-cols-2 gap-1 sm:gap-1.5">
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
                    </div>
                  ))}
                  <div className={`min-w-0 rounded-lg border px-1.5 py-1.5 sm:px-2 sm:py-2 ${lineBox}`}>
                    <p className={`mb-1 text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] ${pairTitle}`}>
                      7. bek
                    </p>
                    <div className="mx-auto flex max-w-[11.5rem] justify-center">
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
                </div>
              </section>

              <section
                className={`rounded-lg border border-dashed px-1.5 py-1.5 sm:px-2 sm:py-2 ${dark ? "border-white/14 bg-black/20" : "border-slate-400/40 bg-white/[0.48]"}`}
              >
                <h2
                  className={`mb-2 text-center font-display text-[12px] font-bold uppercase tracking-[0.18em] sm:text-[13px] ${dark ? "text-white/90" : "text-slate-800"}`}
                >
                  Doplněk soupisky
                </h2>
                <p className={`mb-2 text-center text-[11px] font-semibold uppercase tracking-wider ${subheading}`}>
                  13. útok · náhradníci
                </p>
                <div className={`grid min-w-0 gap-1.5 sm:gap-2 ${extraD ? "grid-cols-3" : "grid-cols-2"}`}>
                  <div className="min-w-0">
                    <p className={`mb-1 text-center text-[10px] font-bold uppercase tracking-wider sm:text-[12px] ${subheading}`}>
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
                    <p className={`mb-1 text-center text-[10px] font-bold uppercase tracking-wider sm:text-[12px] ${subheading}`}>
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
                      <p className={`mb-1 text-center text-[10px] font-bold uppercase tracking-wider sm:text-[12px] ${subheading}`}>
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
                  <p className={`mt-2 text-center text-[11px] leading-snug sm:text-[12px] ${subheading}`}>
                    Osmého beka doplň v editoru pod 7. bekem.
                  </p>
                ) : null}
              </section>
            </div>
          </div>
        </div>

        <footer
          className={`flex flex-col gap-2 border-t px-6 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:px-8 ${
            dark ? "border-white/10 bg-black/35" : "border-slate-200/90 bg-slate-100/80"
          }`}
        >
          <div className={`max-w-[48%] text-left text-[11px] leading-snug sm:text-[12px] ${dark ? "text-white/45" : "text-slate-500"}`}>
            <p className="font-display font-bold tracking-wide text-[#c8102e]">Lineup 2026</p>
            {wm ? <p className="mt-0.5 font-medium text-white/70">{wm}</p> : null}
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className={`text-[13px] font-medium ${dark ? "text-white/75" : "text-slate-600"}`}>
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
