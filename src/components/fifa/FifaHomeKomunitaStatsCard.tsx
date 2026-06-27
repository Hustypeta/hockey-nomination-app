"use client";

import type { ReactNode } from "react";
import { Shield, Star, Trophy, Users } from "lucide-react";
import { useContestStats } from "@/hooks/useContestStats";

function formatCs(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n);
}

function StatTile({
  icon,
  value,
  label,
  className = "",
  nested = false,
}: {
  icon: ReactNode;
  value: number | null;
  label: string;
  className?: string;
  nested?: boolean;
}) {
  return (
    <div
      className={`fifa-komunita-stat ${nested ? "fifa-komunita-stat--nested" : ""} ${className}`.trim()}
    >
      <span className="fifa-komunita-stat__icon">{icon}</span>
      <span className="fifa-komunita-stat__value">
        {value === null ? "—" : formatCs(value)}
      </span>
      <div className="fifa-komunita-stat__divider" aria-hidden />
      <p className="fifa-komunita-stat__label">{label}</p>
    </div>
  );
}

export function FifaHomeKomunitaStatsCard() {
  const { nominationCount, communityUsersCount, fantasyPlayersCount } = useContestStats();

  return (
    <div className="fifa-komunita-stats">
      <StatTile
        className="fifa-komunita-stat--community"
        icon={
          <span className="relative inline-flex">
            <Users className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} aria-hidden />
            <Shield
              className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 text-sky-300"
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
        }
        value={communityUsersCount}
        label="V komunitě"
      />

      <div className="fifa-komunita-contest" aria-label="Soutěže MS 2026">
        <div className="fifa-komunita-contest__panel">
          <div className="fifa-komunita-contest__grid">
            <StatTile
              nested
              icon={<Trophy className="h-[1rem] w-[1rem]" strokeWidth={2.25} aria-hidden />}
              value={nominationCount}
              label="Nominací"
            />
            <StatTile
              nested
              icon={<Star className="h-[1rem] w-[1rem]" strokeWidth={2.25} aria-hidden />}
              value={fantasyPlayersCount}
              label="Hráčů Fantasy"
            />
          </div>
          <div className="fifa-komunita-contest__footer">
            <span className="fifa-komunita-contest__footer-line" aria-hidden />
            <span className="fifa-komunita-contest__badge">MS 2026</span>
            <span className="fifa-komunita-contest__footer-line" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
