"use client";

import { contestRankEmoji, formatContestPointsOfMax } from "@/lib/contestRankDisplay";
import { useContestStanding } from "@/hooks/useContestStanding";

type UserContestStandingLineProps = {
  className?: string;
  /** Jedna řádka vedle avataru; dvě řádky v položce menu. */
  multiline?: boolean;
  /** Kratší zápis do hlavičky (46/193 · #25). */
  compact?: boolean;
};

/** Body a pořadí v nominaci — jen text, bez odkazu na žebříček. */
export function UserContestStandingLine({
  className = "",
  multiline = false,
  compact = false,
}: UserContestStandingLineProps) {
  const { standing, loading, isAuthenticated } = useContestStanding();

  if (!isAuthenticated || loading || !standing.published || !standing.participant) {
    return null;
  }

  if (standing.rank == null || standing.points == null) return null;

  const pointsLabel =
    standing.maxPoints != null
      ? formatContestPointsOfMax(standing.points, standing.maxPoints)
      : `${standing.points} bodů`;

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
    const max = standing.maxPoints ?? "?";
    return (
      <span
        className={`whitespace-nowrap text-[11px] font-bold tabular-nums leading-tight ${
          isPodium ? "text-[#f1e6a8]" : "text-sky-200/95"
        } ${className}`}
        title={`${pointsLabel} · ${standing.rank}. místo z ${standing.totalParticipants}`}
      >
        {standing.points}/{max} · #{standing.rank}
      </span>
    );
  }

  if (multiline) {
    return (
      <span
        className={`block text-left font-semibold tabular-nums leading-snug ${isPodium ? "text-[#f1e6a8]" : "text-sky-200/95"} ${className}`}
      >
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
        isPodium ? "text-[#f1e6a8]" : "text-sky-200/95"
      } ${className}`}
    >
      {pointsLabel} · {rankPart}
    </span>
  );
}
