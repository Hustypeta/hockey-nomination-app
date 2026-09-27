"use client";

import { Users } from "lucide-react";
import { authorInitials, formatRelativeTime } from "@/lib/community/display";
import type { CommunityMemberDto } from "@/lib/community/types";

export function FifaForumMembersPanel({ members }: { members: CommunityMemberDto[] | null }) {
  const activeCount = members?.filter((member) => member.active).length ?? 0;

  return (
    <div className="fifa-forum-members">
      <div className="fifa-forum-members__head">
        <span>
          <Users className="fifa-forum-sidebar__heading-icon" aria-hidden />
          Členové
        </span>
        {activeCount > 0 ? <strong>{activeCount}</strong> : null}
      </div>
      {members === null ? null : members.length > 0 ? (
        <ul className="fifa-forum-members__list">
          {members.map((member) => (
            <li className="fifa-forum-members__item" key={member.id}>
              <span className="fifa-forum-members__avatar" aria-hidden>
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt="" />
                ) : (
                  authorInitials(member.displayName)
                )}
                <span
                  className={`fifa-forum-members__status ${
                    member.active
                      ? "fifa-forum-members__status--active"
                      : "fifa-forum-members__status--inactive"
                  }`}
                />
              </span>
              <span className="fifa-forum-members__identity">
                <strong className={member.isStaff ? "fifa-forum-members__staff" : ""}>
                  {member.displayName}
                </strong>
                <time dateTime={member.lastActiveAt}>
                  {member.active ? "aktivní" : formatRelativeTime(member.lastActiveAt)}
                </time>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="fifa-forum-sidebar__empty">Zatím žádní členové</p>
      )}
    </div>
  );
}
