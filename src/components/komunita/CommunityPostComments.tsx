"use client";

import { Loader2, Send } from "lucide-react";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { authorInitials, formatRelativeTime } from "@/lib/community/display";
import type { CommunityCommentDto } from "@/lib/community/types";
import { FIFA_BTN_PRIMARY, FIFA_INPUT } from "@/lib/fifa/fifaUiClasses";

export function CommunityPostComments({
  comments,
  loading,
  commentText,
  onCommentTextChange,
  onSubmitComment,
  commentBusy,
  showCompose,
}: {
  comments: CommunityCommentDto[];
  loading: boolean;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onSubmitComment: () => void;
  commentBusy: boolean;
  showCompose: boolean;
}) {
  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, CommunityCommentDto[]>>((acc, c) => {
    if (!c.parentId) return acc;
    (acc[c.parentId] ??= []).push(c);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="fifa-forum-feed-card__comments-loading">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--fifa-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="fifa-forum-feed-card__comments">
      {topLevel.length === 0 ? (
        <p className="text-xs text-[var(--fifa-text-muted)]">Zatím žádné komentáře.</p>
      ) : (
        <ul className="fifa-forum-feed-card__comments-list">
          {topLevel.map((c) => (
            <li key={c.id} className="fifa-forum-comment">
              <div className="fifa-forum-comment__header">
                <div className="fifa-forum-avatar fifa-forum-avatar--sm" aria-hidden>
                  {c.author.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.author.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    authorInitials(c.author.displayName)
                  )}
                </div>
                <p className="text-[11px] text-[var(--fifa-text-muted)]">
                  <span className="font-semibold text-[var(--fifa-text-secondary)]">{c.author.displayName}</span>
                  {" · "}
                  {formatRelativeTime(c.createdAt)}
                </p>
              </div>
              <CommunityBody text={c.bodyMd} className="mt-1.5 text-sm" />
              {(repliesByParent[c.id] ?? []).map((r) => (
                <div key={r.id} className="ml-4 mt-2 border-l border-[var(--fifa-border)] pl-3">
                  <p className="text-[11px] text-[var(--fifa-text-muted)]">
                    <span className="font-semibold text-[var(--fifa-text-secondary)]">{r.author.displayName}</span>
                  </p>
                  <CommunityBody text={r.bodyMd} className="mt-1 text-sm" />
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      {showCompose ? (
        <div className="fifa-forum-compose mt-3 flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            rows={2}
            placeholder="Napsat komentář…"
            className={`${FIFA_INPUT} min-h-[44px] flex-1 resize-none py-2`}
          />
          <button
            type="button"
            disabled={commentBusy || !commentText.trim()}
            onClick={onSubmitComment}
            className={`${FIFA_BTN_PRIMARY} shrink-0 px-3 self-end disabled:opacity-40`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
