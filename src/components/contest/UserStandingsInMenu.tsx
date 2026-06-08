"use client";

import { UserFantasyStandingLine } from "@/components/fantasy/UserFantasyStandingLine";

type UserStandingsInMenuProps = {
  className?: string;
  multiline?: boolean;
  compact?: boolean;
};

/** Body fantasy v hlavičce / menu — jen fantasy, ne nominace. */
export function UserStandingsInMenu({
  className = "",
  multiline = false,
  compact = false,
}: UserStandingsInMenuProps) {
  return (
    <UserFantasyStandingLine className={className} multiline={multiline} compact={compact} />
  );
}
