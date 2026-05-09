"use client";

import { forwardRef, useMemo, useState, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";
import { rosterLastDisplay } from "@/lib/namesOnlyRoster";

const RATING_SECTIONS: MatchLineupPosterGroup[] = ["goalies", "defense", "forwards-12", "forwards-34"];

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function fmtAvg(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "–";
  return n.toFixed(1).replace(".", ",");
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-center font-display text-[13px] font-bold uppercase tracking-[0.26em] text-white/92 antialiased sm:text-[14px]">
      {children}
    </h3>
  );
}

function NameOnlyPill({ children }: { children: string }) {
  return (
    <div className="flex min-h-[2.75rem] items-center justify-center rounded-lg bg-white/[0.96] px-2.5 py-2 text-center font-sans text-[17px] font-bold leading-snug tracking-wide text-[#0a1628] shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[2.85rem] sm:text-[18px]">
      <span className="line-clamp-2 break-words">{children}</span>
    </div>
  );
}

function NameRatingPill({ nameLine, avgLine }: { nameLine: string; avgLine: string }) {
  return (
    <div className="flex min-h-[2.95rem] flex-col items-center justify-center gap-1 rounded-lg bg-white/[0.96] px-2.5 py-2 text-center shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[3rem]">
      <span className="font-sans text-[16px] font-bold leading-snug tracking-wide text-[#0a1628] sm:text-[17px]">
        <span className="line-clamp-2 break-words">{nameLine}</span>
      </span>
      <span className="font-display text-[13px] font-black tabular-nums text-[#b45309] sm:text-[14px]">Ø {avgLine}</span>
    </div>
  );
}

interface BaseFixtureNamesFullPosterProps {
  headline: string;
  /** Nadpisek pod červenou linkou (datum zápasu u hodnocení apod.). */
  subline?: string;
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  siteUrl?: string;
  footerInstantIso?: string | null;
}

type RatingMap = Record<string, { avg: number; count: number } | undefined>;

const lineupSharedRoot =
  "match-lineup-names-full-poster relative shrink-0 overflow-hidden rounded-none border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]";

const ratingSharedRoot =
  "match-rating-names-full-poster relative shrink-0 overflow-hidden rounded-none border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]";

export const MatchLineupNamesFullPoster = forwardRef<HTMLDivElement, BaseFixtureNamesFullPosterProps>(
  function MatchLineupNamesFullPoster(
    { headline, subline, lineup, players, defenseCount, allowExtraForward, siteUrl = "", footerInstantIso = null },
    ref
  ) {
    const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
    const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
    const host = siteUrl.replace(/^https?:\/\//, "");
    const titleLine = headline.trim();

    const goalies = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, "goalies", defenseCount, allowExtraForward);
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    const defense = useMemo(() => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, "defense", defenseCount, allowExtraForward);
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    const forwards = useMemo(() => {
      const ids12 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-12", defenseCount, allowExtraForward);
      const ids34 = pickMatchLineupSegmentPlayerIds(lineup, "forwards-34", defenseCount, allowExtraForward);
      const ids = [...ids12, ...ids34];
      return ids.map((id) => rosterLastDisplay(players, id));
    }, [lineup, players, defenseCount, allowExtraForward]);

    return (
      <div ref={ref} data-export-slot="cele-jmena" className={lineupSharedRoot} style={{ width: SHARE_POSTER_WIDTH_PX, maxWidth: SHARE_POSTER_WIDTH_PX }}>
        <DecorativeBg />
        <div className="relative z-[1] px-9 pb-6 pt-10 sm:px-11 sm:pb-8 sm:pt-11">
          <PosterHeader eyebrow="MS 2026 · zápas" titleLine={titleLine} subline={subline} kicker="Český nároďák · soupiska · jen jména (komplet)" />

          <div className="mt-8 flex flex-col gap-10 sm:mt-10 sm:gap-12">
            <section>
              <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionTitle>
              <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2.5 sm:gap-3">
                {goalies.map((n, i) => (
                  <NameOnlyPill key={`goalies-${i}`}>{n}</NameOnlyPill>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionTitle>
              <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2.5 sm:gap-3">
                {defense.map((n, i) => (
                  <NameOnlyPill key={`defense-${i}`}>{n}</NameOnlyPill>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>Útočníci</SectionTitle>
              <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2.5 sm:gap-3">
                {forwards.map((n, i) => (
                  <NameOnlyPill key={`forwards-${i}`}>{n}</NameOnlyPill>
                ))}
              </div>
            </section>
          </div>
        </div>

        <NamesFooter dateLabel={dateLabel} host={host} footerTag="Soupiska zápasu" />
      </div>
    );
  }
);

export const MatchRatingNamesFullPoster = forwardRef<
  HTMLDivElement,
  BaseFixtureNamesFullPosterProps & { ratings: RatingMap }
>(function MatchRatingNamesFullPoster(
  { headline, subline, lineup, players, defenseCount, allowExtraForward, ratings, siteUrl = "", footerInstantIso = null },
  ref
) {
  const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
  const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
  const host = siteUrl.replace(/^https?:\/\//, "");
  const titleLine = headline.trim();

  const sections = useMemo(() => {
    return RATING_SECTIONS.map((group) => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward);
      const rows = ids.map((id) => {
        const agg = ratings[id];
        const avg = agg && Number.isFinite(agg.avg) && agg.avg > 0 ? agg.avg : null;
        return { nameLine: rosterLastDisplay(players, id), avgLine: fmtAvg(avg) };
      });
      return { group, rows };
    });
  }, [lineup, players, defenseCount, allowExtraForward, ratings]);

  return (
    <div ref={ref} data-export-slot="cele-jmena" className={ratingSharedRoot} style={{ width: SHARE_POSTER_WIDTH_PX, maxWidth: SHARE_POSTER_WIDTH_PX }}>
      <DecorativeBg />
      <div className="relative z-[1] px-9 pb-6 pt-10 sm:px-11 sm:pb-8 sm:pt-11">
        <PosterHeader eyebrow="Hodnocení hráčů" titleLine={titleLine} subline={subline} kicker="Průměry fanoušků · jména (komplet)" />

        <div className="mt-8 flex flex-col gap-10 sm:mt-10 sm:gap-12">
          {sections.map(({ group, rows }) => (
            <section key={group}>
              <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE[group]}</SectionTitle>
              <div className={`mx-auto grid max-w-3xl gap-2.5 ${gridColsFor(group)} sm:gap-3`}>
                {rows.map((row, i) => (
                  <NameRatingPill key={`${group}-${i}`} nameLine={row.nameLine} avgLine={row.avgLine} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <NamesFooter dateLabel={dateLabel} host={host} footerTag="Hodnocení zápasu" />
    </div>
  );
});

function gridColsFor(group: MatchLineupPosterGroup) {
  return group === "goalies" ? "grid-cols-3" : group === "defense" ? "grid-cols-2" : "grid-cols-3";
}

function DecorativeBg() {
  return (
    <>
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
    </>
  );
}

function PosterHeader({
  eyebrow,
  titleLine,
  subline,
  kicker,
}: {
  eyebrow: string;
  titleLine: string;
  subline?: string;
  kicker: string;
}) {
  return (
    <header className="max-w-[62%] pr-2">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-[#c8102e]/95">{eyebrow}</p>
      {titleLine ? (
        <h1 className="mt-2 line-clamp-4 font-display text-[1.45rem] font-bold leading-[1.12] tracking-wide text-white sm:text-[1.75rem]">
          {titleLine}
        </h1>
      ) : null}
      {subline ? <p className="mt-1.5 font-display text-sm text-white/52">{subline}</p> : null}
      <p className={`font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-white/52 ${titleLine || subline ? "mt-2" : "mt-3"}`}>{kicker}</p>
    </header>
  );
}

function NamesFooter({
  dateLabel,
  host,
  footerTag,
}: {
  dateLabel: string;
  host: string;
  footerTag: string;
}) {
  return (
    <footer className="relative z-[1] flex flex-col gap-2 border-t border-white/[0.09] bg-black/45 px-8 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-10">
      <div className="max-w-[46%] text-left text-[11px] leading-snug text-white/55 sm:text-[12px]">
        <p className="font-display font-bold tracking-wide text-[#c8102e]">{footerTag}</p>
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-[13px] font-medium text-white/78">Exportováno {dateLabel}</p>
        {host ? <p className="mt-1 font-display text-sm tracking-wide text-[#7ec8ff]/95">{host}</p> : null}
      </div>
      <div className="hidden w-[46%] sm:block" aria-hidden />
    </footer>
  );
}
