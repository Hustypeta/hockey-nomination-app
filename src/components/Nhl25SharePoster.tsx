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

/**
 * Centrování karty v buňce mřížky. Bez `overflow-hidden` — ten ořezával příjmení pod siluetou
 * (řádek hem + vlajka je širší než samotný dres), např. „MANDÁT“ → „MANDÁ“.
 * Ořez siluety řeší vnitřní wrapper v `Nhl25JerseyCard` (`nameplateVariant="poster"`).
 */
function PosterJerseyWrap({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 w-full justify-center overflow-visible">{children}</div>
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
      ? "border-0 bg-gradient-to-b from-[#0f141c] via-[#0a0d12] to-[#050608] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
      : "border-0 bg-gradient-to-b from-white via-[#f4f6f9] to-[#e8ecf2] shadow-[0_20px_50px_rgba(15,23,42,0.12)]";
    /** Bez velkého „bílého rámečku“ — jen siluety, více místa pro dresy (export / IG). */
    const innerChrome =
      dark ? "border-0 bg-transparent shadow-none" : "border-0 bg-transparent shadow-none";
    const heading = dark ? "border-white/15 text-white" : "border-slate-300 text-slate-900";
    const subheading = dark ? "text-white/78" : "text-slate-700";
    const lineBox =
      dark ? "border-white/[0.14] bg-black/[0.28]" : "border-slate-400/35 bg-white/[0.52]";
    const pairTitle = dark ? "text-white/68" : "text-slate-600";

    return (
      <div
        ref={ref}
        data-poster-surface={dark ? "dark" : "light"}
        className={`nhl25-share-poster-capture relative shrink-0 overflow-hidden rounded-none border-0 antialiased subpixel-antialiased [text-rendering:optimizeLegibility] ${shell}`}
        style={{ width: SHARE_POSTER_WIDTH_PX, maxWidth: SHARE_POSTER_WIDTH_PX }}
      >
        <div className="nhl25-moje-sestava-accent mx-2 mt-1.5 rounded-full sm:mx-2 sm:mt-2" aria-hidden />

        <header className="relative px-2 pb-0.5 pt-2 sm:px-2">
          <div className="min-w-0 text-center sm:text-left">
            {titleLine ? (
              <h1
                className={`line-clamp-3 font-display text-[1.78rem] font-extrabold leading-[1.08] tracking-tight sm:text-[2.05rem] ${dark ? "text-white drop-shadow-sm" : "text-slate-950 [text-shadow:0_1px_0_rgba(255,255,255,0.9)]"}`}
              >
                {titleLine}
              </h1>
            ) : null}
            <p
              className={`font-display text-[15px] font-bold uppercase tracking-[0.14em] sm:text-[16px] ${dark ? "text-sky-300" : "text-[#003087]"} ${titleLine ? "mt-1" : ""}`}
            >
              Český nároďák · soupiska
            </p>
          </div>
        </header>

        <div className={`relative mx-0 mb-1 mt-0.5 px-2 py-0 sm:mb-1.5 sm:px-2 ${innerChrome}`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:gap-x-5 sm:gap-y-3">
            <div className="min-w-0 space-y-2 sm:space-y-2.5">
              <section>
                <h2 className={`mb-1 border-b pb-1 font-display text-[15px] font-extrabold uppercase tracking-[0.12em] sm:mb-1.5 sm:pb-1.5 sm:text-[17px] ${heading}`}>
                  Brankáři
                </h2>
                <div className="grid min-w-0 grid-cols-3 gap-x-3.5 gap-y-1 sm:gap-x-4 sm:gap-y-1">
                  {lineup.goalies.map((gid, i) => (
                    <div key={`g-${i}`} className="flex min-w-0 flex-col gap-0.5">
                      <span className={`shrink-0 text-center font-display text-[14px] font-bold uppercase tracking-wide sm:text-[15px] ${subheading}`}>
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
                <h2 className={`mb-1 border-b pb-1 font-display text-[15px] font-extrabold uppercase tracking-[0.12em] sm:mb-1.5 sm:pb-1.5 sm:text-[17px] ${heading}`}>
                  Útočné řady
                </h2>
                <div className="space-y-1 sm:space-y-1.5">
                  {lineup.forwardLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex min-w-0 flex-col gap-0 overflow-hidden rounded-lg border px-1 py-1 sm:gap-0.5 sm:px-1.5 sm:py-1.5 ${lineBox}`}
                    >
                      <span className={`shrink-0 font-display text-[14px] font-bold uppercase tracking-wide sm:text-[15px] ${subheading}`}>
                        {i + 1}. lajna
                      </span>
                      <div className="grid min-w-0 w-full grid-cols-3 gap-x-3.5 gap-y-0 sm:gap-x-4">
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

            <div className="min-w-0 space-y-2 sm:space-y-2.5">
              <section>
                <h2 className={`mb-1 border-b pb-1 font-display text-[15px] font-extrabold uppercase tracking-[0.12em] sm:mb-1.5 sm:pb-1.5 sm:text-[17px] ${heading}`}>
                  Obranné páry
                </h2>
                <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
                  {lineup.defensePairs.slice(0, 3).map((pair, i) => (
                    <div key={i} className={`min-w-0 rounded-lg border px-1 py-1 sm:px-1.5 sm:py-1.5 ${lineBox}`}>
                      <p className={`mb-0.5 text-center font-display text-[14px] font-extrabold uppercase tracking-[0.1em] sm:text-[15px] ${pairTitle}`}>
                        {i + 1}. pár
                      </p>
                      <div className="grid min-w-0 w-full grid-cols-2 gap-x-3.5 gap-y-0 sm:gap-x-4">
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
                  <div className={`min-w-0 rounded-lg border px-1 py-1 sm:px-1.5 sm:py-1.5 ${lineBox}`}>
                    <p className={`mb-0.5 text-center font-display text-[14px] font-extrabold uppercase tracking-[0.1em] sm:text-[15px] ${pairTitle}`}>
                      7. bek
                    </p>
                    <div className="flex w-full min-w-0 justify-center">
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
                className={`rounded-lg border border-dashed px-1 py-1 sm:px-1.5 sm:py-1.5 ${dark ? "border-white/14 bg-black/20" : "border-slate-400/40 bg-white/[0.48]"}`}
              >
                <h2
                  className={`mb-1 text-center font-display text-[15px] font-extrabold uppercase tracking-[0.1em] sm:text-[17px] ${dark ? "text-white" : "text-slate-900"}`}
                >
                  Doplněk soupisky
                </h2>
                <p className={`mb-0.5 text-center font-display text-[13px] font-bold uppercase tracking-wider sm:text-[14.5px] ${subheading}`}>
                  13. útok · náhradníci
                </p>
                <div className={`grid min-w-0 gap-x-3.5 gap-y-1 sm:gap-x-4 sm:gap-y-1 ${extraD ? "grid-cols-3" : "grid-cols-2"}`}>
                  <div className="min-w-0">
                    <p className={`mb-0.5 text-center font-display text-[13px] font-bold uppercase tracking-wider sm:text-[14.5px] ${subheading}`}>
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
                    <p className={`mb-0.5 text-center font-display text-[13px] font-bold uppercase tracking-wider sm:text-[14.5px] ${subheading}`}>
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
                      <p className={`mb-0.5 text-center font-display text-[13px] font-bold uppercase tracking-wider sm:text-[14.5px] ${subheading}`}>
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
                  <p className={`mt-1 text-center font-display text-[13px] font-semibold leading-snug sm:text-[14px] ${subheading}`}>
                    Osmého beka doplň v editoru pod 7. bekem.
                  </p>
                ) : null}
              </section>
            </div>
          </div>
        </div>

        <footer
          className={`flex flex-col gap-1 border-t px-2 py-2 sm:flex-row sm:items-end sm:justify-between sm:px-2 sm:py-2.5 ${
            dark ? "border-white/10 bg-black/35" : "border-slate-200/90 bg-slate-100/80"
          }`}
        >
          <div className={`max-w-[48%] text-left text-[13px] font-medium leading-snug sm:text-[14px] ${dark ? "text-white/65" : "text-slate-600"}`}>
            <p className="font-display text-[14px] font-extrabold tracking-wide text-[#c8102e] sm:text-[15px]">
              Lineup 2026
            </p>
            {wm ? (
              <p className={`mt-1 font-semibold ${dark ? "text-white/85" : "text-slate-700"}`}>{wm}</p>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className={`text-[14px] font-semibold sm:text-[15px] ${dark ? "text-white/88" : "text-slate-800"}`}>
              {dateLabel ? `Sestaveno ${dateLabel}` : "Sestaveno"}
            </p>
            {host ? (
              <p className={`mt-0.5 font-display text-[13px] font-bold tracking-wide sm:text-[14px] ${dark ? "text-sky-300" : "text-[#003087]"}`}>
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
