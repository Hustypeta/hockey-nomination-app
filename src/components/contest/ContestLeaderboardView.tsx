"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContestLeaderboardRow } from "@/lib/contestLeaderboard";
import { contestRankEmoji, contestRankLabel } from "@/lib/contestRankDisplay";
import { FIFA_LINK } from "@/lib/fifa/fifaUiClasses";

function lbRowClass(rank: number, panel: boolean): string {
  const size = panel ? "gap-2 px-2 py-2" : "gap-3 rounded-2xl px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5";
  const podium = rank <= 3 ? "fifa-lb-row--podium" : "";
  const first = rank === 1 ? "fifa-lb-row--first" : "";
  return `fifa-lb-row ${size} ${podium} ${first}`.trim();
}

type LeaderboardPayload = {
  published: boolean;
  hidden?: boolean;
  updatedAt: string | null;
  leaderboard: ContestLeaderboardRow[];
  error?: string;
};

type ContestLeaderboardViewProps = {
  /** Sloupec na /zebricek — kompaktní řádky, scroll jen uvnitř sloupce. */
  variant?: "page" | "panel";
};

export function ContestLeaderboardView({ variant = "page" }: ContestLeaderboardViewProps) {
  const panel = variant === "panel";
  const [data, setData] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contest/leaderboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: LeaderboardPayload) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ published: false, hidden: true, updatedAt: null, leaderboard: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className={`text-[var(--fifa-text-muted)] ${panel ? "py-10 text-xs text-center" : "py-16 text-sm text-center"}`}>
        Načítám žebříček…
      </p>
    );
  }

  if (data?.hidden) {
    return (
      <div
        className={`text-center text-[var(--fifa-text-secondary)] ${panel ? "fifa-empty-state !py-8 text-[11px]" : "fifa-empty-state text-sm"}`}
      >
        Žebříček zatím není zveřejněný.
      </div>
    );
  }

  if (!data?.published || !data.updatedAt) {
    return (
      <div
        className={`text-center text-[var(--fifa-text-secondary)] ${
          panel ? "fifa-empty-state !py-8 text-[11px] leading-relaxed" : "fifa-empty-state text-sm"
        }`}
      >
        Oficiální soupiska ještě není k dispozici — žebříček se zobrazí po vyhodnocení nominací.
      </div>
    );
  }

  const rows = data.leaderboard ?? [];
  const updated = new Date(data.updatedAt).toLocaleString("cs-CZ");

  return (
    <div className={panel ? "space-y-2" : "space-y-4"}>
      <p className={`text-[var(--fifa-text-muted)] ${panel ? "text-[10px] leading-snug" : "text-center text-xs"}`}>
        {panel ? (
          <>
            {rows.length} účastníků · {updated}
          </>
        ) : (
          <>Vyhodnoceno vůči oficiální soupisce · aktualizace {updated} · {rows.length} účastníků</>
        )}
      </p>

      <ol className={panel ? "space-y-1.5" : "space-y-2"}>
        {rows.map((row) => {
          const podium = row.rank <= 3;
          const emoji = contestRankEmoji(row.rank);
          return (
            <li key={row.nominationId} className={lbRowClass(row.rank, panel)}>
              <div
                className={`flex shrink-0 items-center justify-center rounded-lg font-black ${
                  panel ? "h-8 w-8 text-sm" : "h-11 w-11 rounded-xl text-lg sm:h-12 sm:w-12"
                } ${podium ? "bg-[var(--fifa-bg-base)] text-[var(--fifa-text)]" : "bg-[var(--fifa-bg-base)] text-[var(--fifa-text-muted)]"}`}
                aria-hidden
              >
                {row.rank === 1 ? "🏆" : emoji ?? row.rank}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold text-[var(--fifa-text)] ${panel ? "text-xs font-display" : "font-display text-base sm:text-lg"}`}>
                  <span className="sr-only">{contestRankLabel(row.rank)} </span>
                  {row.displayName}
                </p>
                {panel ? (
                  <p className="fifa-meta mt-0.5 truncate">
                    {row.breakdown.playerPointsAfterTimeBonus} b.
                    {row.breakdown.captainBonus ? ` · C+${row.breakdown.captainBonus}` : ""}
                    {row.breakdown.timeBonusPercent ? ` · ${row.breakdown.timeBonusPercent}%` : ""}
                  </p>
                ) : (
                  <p className="fifa-meta mt-0.5 sm:text-xs">
                    Hráči {row.breakdown.playerPointsAfterTimeBonus} b.
                    {row.breakdown.captainBonus ? ` · C +${row.breakdown.captainBonus}` : ""}
                    {row.breakdown.assistantBonus ? ` · A +${row.breakdown.assistantBonus}` : ""}
                    {row.breakdown.timeBonusPercent ? ` · bonus ${row.breakdown.timeBonusPercent} %` : ""}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <p className={`font-display font-bold tabular-nums text-[var(--fifa-text)] ${panel ? "text-lg leading-none" : "text-2xl sm:text-3xl"}`}>
                  {row.points}
                </p>
                {!panel ? <p className="fifa-meta font-semibold uppercase tracking-wide">bodů</p> : null}
              </div>
            </li>
          );
        })}
      </ol>

      {!panel ? (
        <p className="fifa-meta text-center">
          Chceš upravit přezdívku ve výsledcích?{" "}
          <Link href="/ucet" className={FIFA_LINK}>
            Můj účet
          </Link>
        </p>
      ) : (
        <p className="fifa-meta text-center">
          <Link href="/ucet" className={FIFA_LINK}>
            Přezdívka v účtu
          </Link>
        </p>
      )}
    </div>
  );
}
