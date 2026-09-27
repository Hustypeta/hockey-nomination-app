"use client";

import { Users } from "lucide-react";
import { FifaForumMembersPanel } from "@/components/fifa/FifaForumMembersPanel";
import type { CommunityMemberDto } from "@/lib/community/types";

function formatCs(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n);
}

export function FifaHomeKomunitaStatsCard({
  communityUsersCount,
  members,
}: {
  communityUsersCount: number | null;
  members: CommunityMemberDto[];
}) {
  return (
    <div className="fifa-komunita-stats">
      <div className="fifa-komunita-stat fifa-komunita-stat--community">
        <span className="fifa-komunita-stat__icon">
          <Users className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} aria-hidden />
        </span>
        <span className="fifa-komunita-stat__value">
          {communityUsersCount === null ? "—" : formatCs(communityUsersCount)}
        </span>
        <p className="fifa-komunita-stat__label">V komunitě</p>
      </div>

      <div className="fifa-komunita-online">
        <FifaForumMembersPanel members={members} />
      </div>
    </div>
  );
}
