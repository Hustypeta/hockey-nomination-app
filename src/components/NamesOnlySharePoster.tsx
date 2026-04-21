"use client";

import { forwardRef, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { Player, LineupStructure } from "@/types";
import { buildNamesOnlyRoster } from "@/lib/namesOnlyRoster";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";

export interface NamesOnlySharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  nominationTitle?: string | null;
  siteUrl?: string;
  footerInstantIso?: string | null;
}

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function NamePill({ children }: { children: string }) {
  return (
    <div className="flex min-h-[2.75rem] items-center justify-center rounded-lg bg-white/[0.96] px-2.5 py-2 text-center font-sans text-[17px] font-bold leading-snug tracking-wide text-[#0a1628] shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[2.85rem] sm:text-[18px]">
      <span className="line-clamp-2 break-words">{children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-center font-display text-[13px] font-bold uppercase tracking-[0.26em] text-white/92 antialiased sm:text-[14px]">
      {children}
    </h3>
  );
}

export const NamesOnlySharePoster = forwardRef<HTMLDivElement, NamesOnlySharePosterProps>(
  function NamesOnlySharePoster(
    { players, lineup, nominationTitle = null, siteUrl = "", footerInstantIso = null },
    ref
  ) {
    const [mountedDateLabel, setMountedDateLabel] = useState("");
    useLayoutEffect(() => {
      setMountedDateLabel(formatCsDate(new Date()));
    }, []);

    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
    const host = siteUrl.replace(/^https?:\/\//, "");
    const titleLine = nominationTitle?.trim() ?? "";

    const { goalies, defense, forwards } = useMemo(
      () => buildNamesOnlyRoster(players, lineup),
      [players, lineup]
    );

    return (
      <div
        ref={ref}
        className="names-only-share-poster relative shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]"
        style={{ width: SHARE_POSTER_WIDTH_PX, maxWidth: SHARE_POSTER_WIDTH_PX }}
      >
        {/* Dekorativní blok v barvách webu — podobný princip jako Livesport */}
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

        <div className="relative z-[1] px-9 pb-9 pt-10 sm:px-11 sm:pb-10 sm:pt-11">
          <header className="max-w-[62%] pr-2">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-[#c8102e]/95">
              MS 2026
            </p>
            {titleLine ? (
              <h1 className="mt-2 line-clamp-3 font-display text-[1.55rem] font-bold leading-[1.12] tracking-wide text-white sm:text-[1.85rem]">
                {titleLine}
              </h1>
            ) : null}
            <p className={`font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-white/52 ${titleLine ? "mt-2" : "mt-3"}`}>
              Český nároďák · soupiska jmen
            </p>
          </header>

          <div className="mt-9 space-y-8 sm:mt-10 sm:space-y-9">
            <section>
              <SectionTitle>Brankáři</SectionTitle>
              <div className="mx-auto grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3">
                {goalies.map((name, i) => (
                  <NamePill key={`g-${i}`}>{name}</NamePill>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Obránci</SectionTitle>
              <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2.5 sm:gap-3">
                {defense.map((name, i) => (
                  <NamePill key={`d-${i}`}>{name}</NamePill>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Útočníci</SectionTitle>
              <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2.5 sm:gap-3">
                {forwards.map((name, i) => (
                  <NamePill key={`f-${i}`}>{name}</NamePill>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="relative z-[1] flex flex-col gap-2 border-t border-white/[0.09] bg-black/45 px-8 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div className="max-w-[46%] text-left text-[11px] leading-snug text-white/55 sm:text-[12px]">
            <p className="font-display font-bold tracking-wide text-[#c8102e]">Lineup 2026</p>
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[13px] font-medium text-white/78">{dateLabel ? `Sestaveno ${dateLabel}` : "Sestaveno"}</p>
            {host ? (
              <p className="mt-1 font-display text-sm tracking-wide text-[#7ec8ff]/95">{host}</p>
            ) : null}
          </div>
          <div className="hidden w-[46%] sm:block" aria-hidden />
        </footer>
      </div>
    );
  }
);
