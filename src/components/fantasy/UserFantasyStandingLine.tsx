"use client";

import { contestRankEmoji } from "@/lib/contestRankDisplay";
import { useFantasyStanding } from "@/hooks/useFantasyStanding";

type UserFantasyStandingLineProps = {
  className?: string;
  multiline?: boolean;
  compact?: boolean;
};

/** Body a pořadí ve fantasy — jen text. */
export function UserFantasyStandingLine({
  className = "",
  multiline = false,
  compact = false,
}: UserFantasyStandingLineProps) {
  const { standing, loading, isAuthenticated } = useFantasyStanding();

  if (!isAuthenticated || loading || !standing.published || !standing.participant) {
    return null;
  }

  if (standing.rank == null || standing.points == null) return null;

  const pointsLabel = `${standing.points} bodů`;
  const emoji = contestRankEmoji(standing.rank);
  const isPodium = standing.rank <= 3;
  const rankPart =
    standing.rank === 1 ? (
      <span className="inline-flex items-center gap-1">
        <span aria-hidden>🏆</span>
        <span>1. místo</span>
      </span>
    ) : emoji ? (
      <span className="inline-flex items-center gap-1">
        <span aria-hidden>{emoji}</span>
        <span>{standing.rank}. místo</span>
      </span>
    ) : (
      <span>{standing.rank}. místo</span>
    );

  if (compact) {
    return (
      <span
        className={`whitespace-nowrap text-[11px] font-bold tabular-nums leading-tight ${
          isPodium ? "text-[#f1e6a8]" : "text-amber-200/95"
        } ${className}`}
        title={`Fantasy: ${pointsLabel} · ${standing.rank}. místo z ${standing.totalParticipants}`}
      >
        Fantasy {standing.points}b · #{standing.rank}
      </span>
    );
  }

  if (multiline) {
    return (
      <span
        className={`block text-left font-semibold tabular-nums leading-snug ${isPodium ? "text-[#f1e6a8]" : "text-amber-200/95"} ${className}`}
      >
        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/45">Fantasy</span>
        <span className="block text-sm">{pointsLabel}</span>
        <span className="block text-xs opacity-90">
          {rankPart}
          <span className="text-white/50"> · z {standing.totalParticipants}</span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`whitespace-nowrap text-xs font-bold tabular-nums leading-tight sm:text-[13px] ${
        isPodium ? "text-[#f1e6a8]" : "text-amber-200/95"
      } ${className}`}
    >
      Fantasy · {pointsLabel} · {rankPart}
    </span>
  );
}
