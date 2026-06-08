"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FantasyLeaderboardRow } from "@/lib/msFantasyLeaderboard";
import { contestRankEmoji, contestRankLabel } from "@/lib/contestRankDisplay";

type LeaderboardPayload = {
  published: boolean;
  hidden?: boolean;
  updatedAt: string | null;
  leaderboard: FantasyLeaderboardRow[];
  error?: string;
};

export function FantasyLeaderboardView() {
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
    return <p className="py-16 text-center text-sm text-white/55">Načítám fantasy žebříček…</p>;
  }

  if (data?.hidden) {
    return (
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] px-6 py-10 text-center text-sm text-white/65">
        Fantasy žebříček zatím není zveřejněný.
      </div>
    );
  }

  if (!data?.published || !data.updatedAt) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-6 py-10 text-center text-sm text-amber-50">
        Fantasy výsledky se zobrazí po vyhodnocení všech herních dnů.
      </div>
    );
  }

  const rows = data.leaderboard ?? [];
  const updated = new Date(data.updatedAt).toLocaleString("cs-CZ");

  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-white/50">
        Celkové pořadí MS 2026 · aktualizace {updated} · {rows.length} účastníků
      </p>

      <ol className="space-y-2">
        {rows.map((row) => {
          const podium = row.rank <= 3;
          const emoji = contestRankEmoji(row.rank);
          const expanded = expandedUserId === row.userId;

          return (
            <li
              key={row.userId}
              className={`
                rounded-2xl border px-3 py-3 sm:px-4 sm:py-3.5
                ${
                  row.rank === 1
                    ? "border-[#f1c40f]/50 bg-gradient-to-r from-[#f1c40f]/18 via-amber-500/8 to-[#c8102e]/12 shadow-[0_0_32px_rgba(241,196,15,0.12)]"
                    : row.rank === 2
                      ? "border-slate-300/35 bg-gradient-to-r from-slate-400/12 to-white/[0.04]"
                      : row.rank === 3
                        ? "border-amber-700/35 bg-gradient-to-r from-amber-800/15 to-white/[0.03]"
                        : "border-white/10 bg-white/[0.03]"
                }
              `}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black sm:h-12 sm:w-12 ${
                    podium ? "bg-black/25" : "bg-black/20 text-white/70"
                  }`}
                  aria-hidden
                >
                  {row.rank === 1 ? "🏆" : emoji ?? row.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold text-white sm:text-lg">
                    <span className="sr-only">{contestRankLabel(row.rank)} </span>
                    {row.displayName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/50 sm:text-xs">
                    {row.daysPlayed} {row.daysPlayed === 1 ? "den" : row.daysPlayed < 5 ? "dny" : "dnů"}
                    {expanded
                      ? null
                      : row.days.length > 0
                        ? ` · ${row.days.map((d) => `${d.title} ${d.points}b`).join(" · ")}`
                        : null}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-display text-2xl font-black tabular-nums text-white sm:text-3xl">{row.totalPoints}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">bodů</p>
                </div>
              </div>

              {row.days.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setExpandedUserId(expanded ? null : row.userId)}
                  className="mt-2 text-[11px] font-semibold text-cyan-300/90 hover:text-cyan-200"
                >
                  {expanded ? "Skrýt rozpis dnů" : "Rozpis po dnech"}
                </button>
              ) : null}

              {expanded ? (
                <ul className="mt-2 space-y-1 border-t border-white/[0.08] pt-2 text-xs text-white/60">
                  {row.days.map((d) => (
                    <li key={d.slug} className="flex justify-between gap-3 tabular-nums">
                      <span>{d.title}</span>
                      <span className="font-semibold text-cyan-200/90">{d.points} b</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="text-center text-xs text-white/45">
        Chceš upravit přezdívku ve výsledcích?{" "}
        <Link href="/ucet" className="text-cyan-200/90 underline-offset-2 hover:underline">
          Můj účet
        </Link>
      </p>
    </div>
  );
}
