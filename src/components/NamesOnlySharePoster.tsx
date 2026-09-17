"use client";

import { forwardRef, useMemo, useState, type ReactNode } from "react";
import type { Player, LineupStructure } from "@/types";
import { buildNamesOnlyRoster } from "@/lib/namesOnlyRoster";
import { SHARE_POSTER_3X4_STYLE } from "@/lib/sharePosterLayout";

export interface NamesOnlySharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  nominationTitle?: string | null;
  siteUrl?: string;
  footerInstantIso?: string | null;
  captainId?: string | null;
}

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function NamePill({
  children,
  leadership,
}: {
  children: string;
  leadership?: "C" | "A" | null;
}) {
  return (
    <div className="flex min-h-[2.5rem] items-center justify-center gap-1 rounded-lg bg-white/[0.96] px-2 py-1.5 text-center font-sans text-[15px] font-bold leading-snug tracking-wide text-[#0a1628] shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[2.65rem] sm:text-[16px]">
      <span className="line-clamp-2 min-w-0 break-words">{children}</span>
      {leadership === "C" ? (
        <span
          className="inline-flex h-[1.05em] min-w-[1.05em] shrink-0 items-center justify-center rounded-[2px] bg-[#c8102e] px-[0.12em] font-display text-[0.72em] font-black leading-none text-white"
          aria-label="Kapitán"
        >
          C
        </span>
      ) : null}
      {leadership === "A" ? (
        <span
          className="inline-flex h-[1.05em] min-w-[1.05em] shrink-0 items-center justify-center rounded-[2px] bg-[#003087] px-[0.12em] font-display text-[0.68em] font-black leading-none text-white"
          aria-label="Asistent kapitána"
        >
          A
        </span>
      ) : null}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-center font-display text-[12px] font-bold uppercase tracking-[0.26em] text-white/92 antialiased sm:text-[13px]">
      {children}
    </h3>
  );
}

function leadershipMark(
  playerId: string | null,
  captainId: string | null,
  assistantIds: string[]
): "C" | "A" | null {
  if (!playerId) return null;
  if (captainId === playerId) return "C";
  if (assistantIds.includes(playerId)) return "A";
  return null;
}

export const NamesOnlySharePoster = forwardRef<HTMLDivElement, NamesOnlySharePosterProps>(
  function NamesOnlySharePoster(
    {
      players,
      lineup,
      nominationTitle = null,
      siteUrl = "",
      footerInstantIso = null,
      captainId = null,
    },
    ref
  ) {
    const [mountedDateLabel] = useState(() => formatCsDate(new Date()));

    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
    const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const titleLine = nominationTitle?.trim() ?? "";

    const { goalies, defense, forwards } = useMemo(
      () => buildNamesOnlyRoster(players, lineup),
      [players, lineup]
    );
    const assistantIds = lineup.assistantIds ?? [];

    return (
      <div
        ref={ref}
        className="names-only-share-poster relative flex shrink-0 flex-col overflow-visible rounded-none border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]"
        style={SHARE_POSTER_3X4_STYLE}
      >
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

        <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-8 pb-3 pt-8 sm:px-10 sm:pt-9">
          <header className="max-w-[72%] shrink-0 pr-2">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-[#c8102e]/95">
              MS 2026
            </p>
            {titleLine ? (
              <h1 className="mt-2 line-clamp-3 font-display text-[1.5rem] font-bold leading-[1.1] tracking-wide text-white sm:text-[1.72rem]">
                {titleLine}
              </h1>
            ) : null}
          </header>

          <div className="mt-5 min-h-0 flex-1 space-y-5 sm:mt-6 sm:space-y-6">
            <section>
              <SectionTitle>Brankáři</SectionTitle>
              <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:gap-2.5">
                {goalies.map((entry, i) => (
                  <NamePill
                    key={`g-${i}`}
                    leadership={leadershipMark(entry.id, captainId, assistantIds)}
                  >
                    {entry.name}
                  </NamePill>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Obránci</SectionTitle>
              <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:gap-2.5">
                {defense.map((entry, i) => (
                  <NamePill
                    key={`d-${i}`}
                    leadership={leadershipMark(entry.id, captainId, assistantIds)}
                  >
                    {entry.name}
                  </NamePill>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Útočníci</SectionTitle>
              <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 sm:gap-2.5">
                {forwards.map((entry, i) => (
                  <NamePill
                    key={`f-${i}`}
                    leadership={leadershipMark(entry.id, captainId, assistantIds)}
                  >
                    {entry.name}
                  </NamePill>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="relative z-[1] mt-auto flex shrink-0 flex-col gap-2 border-t border-white/[0.09] bg-black/45 px-8 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div className="max-w-[46%] text-left text-[11px] leading-snug text-white/55 sm:text-[12px]">
            <p className="font-display font-bold tracking-wide text-[#c8102e]">Lineup 2026</p>
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[13px] font-medium text-white/78">{dateLabel ? `Sestaveno ${dateLabel}` : "Sestaveno"}</p>
            <p className="mt-1.5 font-display text-[22px] font-black tracking-[0.14em] text-[#7ec8ff] sm:text-[24px]">
              {host || "hokejlineup.cz"}
            </p>
          </div>
          <div className="hidden w-[46%] sm:block" aria-hidden />
        </footer>
      </div>
    );
  }
);
