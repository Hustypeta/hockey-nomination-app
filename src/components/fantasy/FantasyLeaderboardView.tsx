"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FantasyLeaderboardRow } from "@/lib/msFantasyLeaderboard";
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
  leaderboard: FantasyLeaderboardRow[];
  error?: string;
};

type FantasyLeaderboardViewProps = {
  variant?: "page" | "panel";
};

export function FantasyLeaderboardView({ variant = "page" }: FantasyLeaderboardViewProps) {
  const panel = variant === "panel";
  const [data, setData] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fantasy/leaderboard", { cache: "no-store" })
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
        Načítám fantasy žebříček…
      </p>
    );
  }

  if (data?.hidden) {
    return (
      <div
        className={`text-center text-[var(--fifa-text-secondary)] ${panel ? "fifa-empty-state !py-8 text-[11px]" : "fifa-empty-state text-sm"}`}
      >
        Fantasy žebříček zatím není zveřejněný.
      </div>
    );
  }

  if (!data?.published || !data.updatedAt) {
    return (
      <div
        className={`text-center text-[var(--fifa-text-secondary)] ${panel ? "fifa-empty-state !py-8 text-[11px] leading-relaxed" : "fifa-empty-state text-sm"}`}
      >
        Fantasy výsledky se zobrazí po vyhodnocení všech herních dnů.
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
          <>Celkové pořadí MS 2026 · aktualizace {updated} · {rows.length} účastníků</>
        )}
      </p>

      <ol className={panel ? "space-y-1.5" : "space-y-2"}>
        {rows.map((row) => {
          const podium = row.rank <= 3;
          const emoji = contestRankEmoji(row.rank);
          const expanded = expandedUserId === row.userId;
          const hasDays = row.days.length > 0;

          return (
            <li key={row.userId} className={lbRowClass(row.rank, panel)}>
              <div className={`flex items-center ${panel ? "gap-2" : "gap-3 sm:gap-4"}`}>
                <div
                  className={`flex shrink-0 items-center justify-center font-black ${
                    panel ? "h-8 w-8 rounded-lg text-sm" : "h-11 w-11 rounded-xl text-lg sm:h-12 sm:w-12"
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
                </div>

                <div className="shrink-0 text-right">
                  <p className={`font-display font-bold tabular-nums text-[var(--fifa-text)] ${panel ? "text-lg leading-none" : "text-2xl sm:text-3xl"}`}>
                    {row.totalPoints}
                  </p>
                  {!panel ? <p className="fifa-meta font-semibold uppercase tracking-wide">bodů</p> : null}
                </div>
              </div>

              {!panel && hasDays ? (
                <button
                  type="button"
                  onClick={() => setExpandedUserId(expanded ? null : row.userId)}
                  className="fifa-btn-ghost mt-2 !px-0 text-[var(--fifa-accent-text)]"
                  aria-expanded={expanded}
                >
                  {expanded ? "Skrýt rozpis po dnech" : "Rozpis po dnech"}
                </button>
              ) : null}

              {!panel && expanded && hasDays ? (
                <ul className="mt-2 space-y-1 border-t border-[var(--fifa-border)] pt-2 text-xs text-[var(--fifa-text-secondary)]">
                  {row.days.map((d) => (
                    <li key={d.slug} className="flex justify-between gap-3 tabular-nums">
                      <span>{d.title}</span>
                      <span className="font-semibold text-[var(--fifa-accent-text)]">{d.points} b</span>
                    </li>
                  ))}
                </ul>
              ) : null}
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
            Změnit přezdívku
          </Link>
        </p>
      )}
    </div>
  );
}
