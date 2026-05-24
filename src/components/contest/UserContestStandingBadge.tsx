"use client";

import Link from "next/link";
import { contestRankEmoji } from "@/lib/contestRankDisplay";
import { useContestStanding } from "@/hooks/useContestStanding";

type UserContestStandingBadgeProps = {
  /** Kompaktní varianta vedle avataru v hlavičce. */
  compact?: boolean;
  className?: string;
};

export function UserContestStandingBadge({ compact = false, className = "" }: UserContestStandingBadgeProps) {
  const { standing, loading, isAuthenticated } = useContestStanding();

  if (!isAuthenticated || loading || !standing.published || !standing.participant) {
    return null;
  }

  if (standing.rank == null || standing.points == null) return null;

  const emoji = contestRankEmoji(standing.rank);
  const isPodium = standing.rank <= 3;

  const inner = (
    <span
      className={`
        inline-flex max-w-[11rem] items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[11px] font-bold leading-tight
        ${
          isPodium
            ? "border-[#f1c40f]/45 bg-gradient-to-r from-[#f1c40f]/20 via-amber-500/10 to-[#c8102e]/15 text-[#f1e6a8] shadow-[0_0_20px_rgba(241,196,15,0.15)]"
            : "border-white/14 bg-white/[0.06] text-white/90"
        }
        ${className}
      `}
      title={`Nominační soutěž: ${standing.points} bodů, ${standing.rank}. místo z ${standing.totalParticipants}`}
    >
      {standing.rank === 1 ? (
        <span className="text-sm leading-none" aria-hidden>
          🏆
        </span>
      ) : emoji ? (
        <span className="text-sm leading-none" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <span className="tabular-nums">
        {compact ? (
          <>
            {standing.points} b. · #{standing.rank}
          </>
        ) : (
          <>
            {standing.points} bodů · {standing.rank}. / {standing.totalParticipants}
          </>
        )}
      </span>
    </span>
  );

  return (
    <Link href="/zebricek" className="shrink-0 transition hover:brightness-110">
      {inner}
    </Link>
  );
}
