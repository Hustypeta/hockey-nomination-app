"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useFantasyStanding } from "@/hooks/useFantasyStanding";
import { contestRankHeadline } from "@/lib/contestRankDisplay";
import { FIFA_BTN_SECONDARY, FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";

export function UserFantasyStandingCard() {
  const { standing, loading, isAuthenticated } = useFantasyStanding();

  if (!isAuthenticated || loading) return null;
  if (!standing.published || !standing.participant) return null;
  if (standing.rank == null || standing.points == null) return null;

  const podium = standing.rank <= 3;

  return (
    <div className={`fifa-card mt-4 p-4 lg:mt-5 lg:p-5 ${podium ? "fifa-lb-row--podium" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--fifa-border)] ${
              podium ? "bg-amber-500/10 text-2xl" : "bg-[var(--fifa-bg-surface)] text-amber-300"
            }`}
          >
            {standing.rank === 1 ? (
              <span aria-hidden>🏆</span>
            ) : (
              <Trophy className={`h-6 w-6 ${podium ? "text-amber-400" : ""}`} aria-hidden />
            )}
          </div>
          <div>
            <p className={FIFA_KICKER}>Fantasy MS 2026</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[var(--fifa-text)]">
              {contestRankHeadline(standing.rank)}
            </h2>
            <p className="mt-1 text-sm text-[var(--fifa-text-secondary)]">
              <span className="font-bold tabular-nums text-[var(--fifa-text)]">{standing.points} bodů</span>
              <span> · </span>
              {standing.rank}. z {standing.totalParticipants} účastníků
            </p>
          </div>
        </div>
        <Link href="/zebricek?soutez=fantasy" className={`${FIFA_BTN_SECONDARY} shrink-0`}>
          Celý žebříček
        </Link>
      </div>
    </div>
  );
}
