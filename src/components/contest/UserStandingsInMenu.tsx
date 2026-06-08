"use client";

import { UserContestStandingLine } from "@/components/contest/UserContestStandingLine";
import { UserFantasyStandingLine } from "@/components/fantasy/UserFantasyStandingLine";

type UserStandingsInMenuProps = {
  className?: string;
  multiline?: boolean;
  compact?: boolean;
  /** Na loading page jen fantasy; v menu obě soutěže. */
  variant?: "menu" | "loading";
};

export function UserStandingsInMenu({
  className = "",
  multiline = false,
  compact = false,
  variant = "menu",
}: UserStandingsInMenuProps) {
  if (multiline) {
    return (
      <span className={`block space-y-2 ${className}`}>
        <UserFantasyStandingLine multiline />
        {variant === "menu" ? <UserContestStandingLine multiline /> : null}
      </span>
    );
  }

  if (compact) {
    return (
      <span className={`flex flex-col gap-0.5 ${className}`}>
        <UserFantasyStandingLine compact />
        {variant === "menu" ? <UserContestStandingLine compact /> : null}
      </span>
    );
  }

  return (
    <span className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <UserFantasyStandingLine className="truncate" />
      {variant === "menu" ? <UserContestStandingLine className="truncate" /> : null}
    </span>
  );
}
