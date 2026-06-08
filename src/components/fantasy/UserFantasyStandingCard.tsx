"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useFantasyStanding } from "@/hooks/useFantasyStanding";
import { contestRankHeadline } from "@/lib/contestRankDisplay";

export function UserFantasyStandingCard() {
  const { standing, loading, isAuthenticated } = useFantasyStanding();

  if (!isAuthenticated || loading) return null;
  if (!standing.published || !standing.participant) return null;
  if (standing.rank == null || standing.points == null) return null;

  const podium = standing.rank <= 3;

  return (
    <div
      className={`
        mt-6 rounded-2xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
        ${
          podium
            ? "border-[#f1c40f]/40 bg-gradient-to-br from-[#f1c40f]/12 via-[#0f172a]/90 to-amber-900/20"
            : "border-white/12 bg-[#0f172a]/85"
        }
      `}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              podium ? "bg-[#f1c40f]/15 text-2xl" : "bg-white/[0.06] text-amber-200"
            }`}
          >
            {standing.rank === 1 ? (
              <span aria-hidden>🏆</span>
            ) : (
              <Trophy className={`h-6 w-6 ${podium ? "text-[#f1c40f]" : ""}`} aria-hidden />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Fantasy MS 2026</p>
            <h2 className="mt-1 font-display text-lg font-black text-white">{contestRankHeadline(standing.rank)}</h2>
            <p className="mt-1 text-sm text-white/70">
              <span className="font-bold tabular-nums text-white">{standing.points} bodů</span>
              <span className="text-white/55"> · </span>
              {standing.rank}. z {standing.totalParticipants} účastníků
            </p>
          </div>
        </div>
        <Link
          href="/zebricek?soutez=fantasy"
          className="shrink-0 rounded-xl border border-white/14 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#f1c40f]/40 hover:bg-[#f1c40f]/10"
        >
          Celý žebříček
        </Link>
      </div>
    </div>
  );
}
