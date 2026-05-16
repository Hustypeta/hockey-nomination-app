"use client";

import { forwardRef, useId, useMemo, useState, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { SHARE_POSTER_3X4_STYLE } from "@/lib/sharePosterLayout";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
  splitMatchLineupLinePosterChunks,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";
import { rosterLastDisplay } from "@/lib/namesOnlyRoster";
import { IceRinkShell } from "@/components/shared/IceRinkShell";

const RATING_SECTIONS: MatchLineupPosterGroup[] = ["line-1", "line-2", "line-3", "line-4"];

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
    <h3 className="mb-4 text-center font-display text-[14px] font-bold uppercase tracking-[0.26em] text-white/92 antialiased sm:mb-5 sm:text-[15px]">
      {children}
    </h3>
  );
}

function NameOnlyPill({ children }: { children: string }) {
  return (
    <div className="flex min-h-[3.1rem] items-center justify-center rounded-xl bg-white/[0.96] px-3 py-2.5 text-center font-sans text-[18px] font-bold leading-snug tracking-wide text-[#0a1628] shadow-[0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,24,52,0.06)] antialiased sm:min-h-[3.35rem] sm:text-[19px]">
      <span className="line-clamp-2 break-words">{children}</span>
    </div>
  );
}

function voteLineCs(n: number): string {
  if (n === 1) return "1 hlas";
  if (n >= 2 && n <= 4) return `${n} hlasy`;
  return `${n} hlasů`;
}

/** Kompaktní dlaždice jméno + průměr + hlasy — uvnitř „ledu“ jako ve fantasy editoru. */
function RatingOnIceTile({ nameLine, avgLine, votes }: { nameLine: string; avgLine: string; votes: number }) {
  return (
    <div className="relative flex min-h-[5rem] w-[5rem] flex-col items-center justify-center gap-0.5 rounded-xl border border-white/90 bg-white/[0.96] px-1 py-1.5 text-center shadow-[0_10px_26px_rgba(0,0,0,0.22)] antialiased sm:min-h-[5.35rem] sm:w-[5.35rem]">
      <span className="line-clamp-2 max-w-full break-words font-sans text-[12px] font-bold leading-snug text-[#0a1628] sm:text-[13px]">
        {nameLine}
      </span>
      <span className="font-display text-[11px] font-black tabular-nums text-[#b45309] sm:text-[12px]">Ø {avgLine}</span>
      <span className="text-[8px] font-semibold leading-tight text-slate-500 sm:text-[9px]">{voteLineCs(votes)}</span>
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
  "match-lineup-names-full-poster relative flex shrink-0 flex-col overflow-hidden rounded-none border-0 bg-[#060b14] shadow-[0_24px_70px_rgba(0,0,0,0.45)] antialiased [text-rendering:optimizeLegibility]";

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
      <div ref={ref} data-export-slot="cele-jmena" className={lineupSharedRoot} style={SHARE_POSTER_3X4_STYLE}>
        <DecorativeBg />
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-8 pb-2 pt-8 sm:px-10 sm:pt-9">
          <PosterHeader titleLine={titleLine} subline={subline} />

          <div className="mt-6 flex min-h-0 flex-1 flex-col justify-between py-3 sm:mt-7 sm:py-5">
            <section className="flex shrink-0 flex-col justify-center">
              <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE.goalies}</SectionTitle>
              <div className="mx-auto grid w-full max-w-[520px] grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-x-4 sm:gap-y-4">
                {goalies.map((n, i) => (
                  <NameOnlyPill key={`goalies-${i}`}>{n}</NameOnlyPill>
                ))}
              </div>
            </section>

            <section className="flex min-h-0 flex-[1.15] flex-col justify-center">
              <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE.defense}</SectionTitle>
              <div className="mx-auto grid w-full max-w-[640px] grid-cols-2 gap-x-3 gap-y-3.5 sm:gap-x-4 sm:gap-y-4">
                {defense.map((n, i) => (
                  <NameOnlyPill key={`defense-${i}`}>{n}</NameOnlyPill>
                ))}
              </div>
            </section>

            <section className="flex min-h-0 flex-[1.55] flex-col justify-center">
              <SectionTitle>Útočníci</SectionTitle>
              <div className="mx-auto grid w-full max-w-[920px] grid-cols-3 gap-x-3 gap-y-3.5 sm:gap-x-4 sm:gap-y-4">
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
  const iceUid = useId().replace(/:/g, "");
  const [mountedDateLabel] = useState(() => formatCsDate(new Date()));
  const dateLabel = footerInstantIso ? formatCsDate(new Date(footerInstantIso)) : mountedDateLabel;
  const host = siteUrl.replace(/^https?:\/\//, "");
  const titleLine = headline.trim();

  const lineBlocks = useMemo(() => {
    return RATING_SECTIONS.map((group) => {
      const ids = pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward);
      const chunks = splitMatchLineupLinePosterChunks(ids, group);
      const rows = ids.map((id) => {
        const agg = ratings[id];
        const avg = agg && Number.isFinite(agg.avg) && agg.avg > 0 ? agg.avg : null;
        const votes = typeof agg?.count === "number" && Number.isFinite(agg.count) ? agg.count : 0;
        return {
          id,
          nameLine: rosterLastDisplay(players, id),
          avgLine: fmtAvg(avg),
          votes,
        };
      });
      return { group, chunks, rows };
    });
  }, [lineup, players, defenseCount, allowExtraForward, ratings]);

  return (
    <div ref={ref} data-export-slot="cele-jmena" className={`${ratingSharedRoot} flex flex-col`} style={SHARE_POSTER_3X4_STYLE}>
      <DecorativeBg />
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-8 pb-3 pt-8 sm:px-10 sm:pt-9">
        <PosterHeader eyebrow="Hodnocení hráčů" titleLine={titleLine} subline={subline} />

        <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between gap-2.5 py-1 sm:mt-5">
          {lineBlocks.map(({ group, chunks, rows }) => {
            if (!chunks) return null;
            const byId = new Map(rows.map((r) => [r.id, r]));
            const noiseId = `${iceUid}-n-${group}`;
            const patId = `${iceUid}-p-${group}`;
            return (
              <section key={group} className="min-w-0">
                <SectionTitle>{MATCH_LINEUP_POSTER_GROUP_TITLE[group]}</SectionTitle>
                <p className="mt-1 text-center font-display text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white/38 sm:text-[0.6rem]">
                  Sestava na ledě
                </p>
                <div className="mx-auto mt-1.5 w-full max-w-[20rem] sm:max-w-[18rem]">
                  <IceRinkShell
                    noiseFilterId={noiseId}
                    scratchPatternId={patId}
                    transform="perspective(920px) rotateX(4deg) scale(0.72) translateZ(0)"
                  >
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                      {chunks.forwards.filter(Boolean).map((pid) => {
                        const r = byId.get(pid!);
                        if (!r) return null;
                        return <RatingOnIceTile key={pid} nameLine={r.nameLine} avgLine={r.avgLine} votes={r.votes} />;
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2.5 sm:mt-4 sm:gap-4">
                      {chunks.defense.filter(Boolean).map((pid) => {
                        const r = byId.get(pid!);
                        if (!r) return null;
                        return <RatingOnIceTile key={pid} nameLine={r.nameLine} avgLine={r.avgLine} votes={r.votes} />;
                      })}
                    </div>
                    {chunks.bottom.filter(Boolean).length > 0 ? (
                      <div className="mt-3 flex flex-wrap justify-center gap-2.5 sm:mt-4 sm:gap-4">
                        {chunks.bottom.filter(Boolean).map((pid) => {
                          const r = byId.get(pid!);
                          if (!r) return null;
                          return <RatingOnIceTile key={pid} nameLine={r.nameLine} avgLine={r.avgLine} votes={r.votes} />;
                        })}
                      </div>
                    ) : null}
                  </IceRinkShell>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <NamesFooter dateLabel={dateLabel} host={host} footerTag="Hodnocení zápasu" />
    </div>
  );
}
);


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
}: {
  eyebrow?: string;
  titleLine: string;
  subline?: string;
}) {
  return (
    <header className="max-w-[72%] shrink-0 pr-2">
      {eyebrow ? (
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.32em] text-[#c8102e]/95">{eyebrow}</p>
      ) : null}
      {titleLine ? (
        <h1 className={`line-clamp-3 font-display text-[1.5rem] font-bold leading-[1.1] tracking-wide text-white sm:text-[1.72rem] ${eyebrow ? "mt-2" : ""}`}>
          {titleLine}
        </h1>
      ) : null}
      {subline ? <p className="mt-1.5 font-display text-sm text-white/52">{subline}</p> : null}
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
    <footer className="relative z-[1] mt-auto flex shrink-0 flex-col gap-2 border-t border-white/[0.09] bg-black/45 px-8 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-10">
      <div className="max-w-[46%] text-left text-[11px] leading-snug text-white/55 sm:text-[12px]">
        <p className="font-display font-bold tracking-wide text-[#c8102e]">{footerTag}</p>
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-[13px] font-medium text-white/78">Exportováno {dateLabel}</p>
        <p className="mt-1.5 font-display text-[22px] font-black tracking-[0.14em] text-[#7ec8ff] sm:text-[24px]">
          {host || "hokejlineup.cz"}
        </p>
      </div>
      <div className="hidden w-[46%] sm:block" aria-hidden />
    </footer>
  );
}
