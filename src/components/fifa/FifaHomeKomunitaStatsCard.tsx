"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { FifaForumMembersPanel } from "@/components/fifa/FifaForumMembersPanel";
import { useContestStats } from "@/hooks/useContestStats";
import type { CommunityMemberDto } from "@/lib/community/types";

function formatCs(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n);
}

export function FifaHomeKomunitaStatsCard({
  communityUsersCount: initialCount,
  members: initialMembers,
}: {
  communityUsersCount: number | null;
  members: CommunityMemberDto[];
}) {
  const { communityUsersCount: liveCount } = useContestStats();
  const [members, setMembers] = useState<CommunityMemberDto[]>(initialMembers);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/forum/members", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { members?: CommunityMemberDto[] }) => {
        if (!cancelled && Array.isArray(data.members)) setMembers(data.members);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const communityUsersCount = liveCount ?? initialCount;

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
