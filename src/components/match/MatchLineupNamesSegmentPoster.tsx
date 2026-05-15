"use client";

import { forwardRef, useMemo, useState, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { SHARE_POSTER_3X4_STYLE } from "@/lib/sharePosterLayout";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";
import { rosterLastDisplay } from "@/lib/namesOnlyRoster";

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function NamePill({ children }: { children: string }) {
  return (
    <div className="flex min-h-[3.1rem] items-center justify-center rounded-xl bg-white/[0.96] px-3 py-2.5 text-center font-sans text-[18px] font-bold leading-snug tracking-wide text-[#0a1628] shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[3.35rem] sm:text-[19px]">
      <span className="line-clamp-2 break-words">{children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.26em] text-white/92 antialiased sm:mb-5 sm:text-[15px]">
      {children}
    </h3>
  );
}

interface MatchLineupNamesSegmentPosterProps {
  lineupTitle: string;
  group: MatchLineupPosterGroup;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  siteUrl?: string;
  footerInstantIso?: string | null;
}

/**
 * Jedna část exportu „jen jména“ — stejný vizuální styl jako {@link NamesOnlySharePoster}, jedna sekce.
 */
export const MatchLineupNamesSegmentPoster = forwardRef<HTMLDivElement, MatchLineupNamesSegmentPosterProps>(
  function MatchLineupNamesSegmentPoster(
    {
      lineupTitle,
      group,
      players,
      lineup,
      defenseCount,
      allowExtraForward,
      siteUrl = "",
      footerInstantIso = null,
    },
    ref
  ) {
    const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
    const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const titleLine = lineupTitle?.trim() ?? "";

    const names = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward);
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [players, lineup, group, defenseCount, allowExtraForward]);

    const gridCols =
      group === "goalies" ? "grid-cols-2" : group.startsWith("line-") ? "grid-cols-3" : "grid-cols-2";

    return (
      <div
        ref={ref}
        className="match-lineup-names-segment-poster relative flex shrink-0 flex-col overflow-hidden rounded-none border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]"
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
            {titleLine ? (
              <h1 className="line-clamp-2 font-display text-[1.5rem] font-bold leading-[1.1] tracking-wide text-white sm:text-[1.72rem]">
                {titleLine}
              </h1>
            ) : null}
            <p
              className={`font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-white/52 ${titleLine ? "mt-2" : "mt-0"}`}
            >
              {MATCH_LINEUP_POSTER_GROUP_TITLE[group]}
            </p>
          </header>

          <div className="flex min-h-0 flex-1 flex-col justify-center py-6">
            <section>
              <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE[group]}</SectionTitle>
              <div className={`mx-auto grid w-full max-w-3xl gap-3 ${gridCols} sm:gap-3.5`}>
                {names.map((name, i) => (
                  <NamePill key={`${group}-${i}`}>{name}</NamePill>
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
