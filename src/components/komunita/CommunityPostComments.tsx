"use client";

import { Heart, Loader2, Reply, Send, X } from "lucide-react";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { authorInitials, formatRelativeTime } from "@/lib/community/display";
import type { CommunityCommentDto } from "@/lib/community/types";
import { FIFA_BTN_PRIMARY, FIFA_INPUT } from "@/lib/fifa/fifaUiClasses";

export function CommunityCommentLikeButton({
  comment,
  busy,
  onToggle,
}: {
  comment: CommunityCommentDto;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold disabled:opacity-40 ${
        comment.likedByMe
          ? "text-[var(--fifa-cta)]"
          : "text-[var(--fifa-text-muted)] hover:text-[var(--fifa-text)]"
      }`}
      aria-label={`Lajk (${comment.likeCount})`}
      aria-pressed={comment.likedByMe}
    >
      <Heart className={`h-3.5 w-3.5 ${comment.likedByMe ? "fill-current" : ""}`} aria-hidden />
      <span>{comment.likeCount}</span>
    </button>
  );
}

export function CommunityPostComments({
  comments,
  loading,
  commentText,
  onCommentTextChange,
  onSubmitComment,
  commentBusy,
  showCompose,
  replyToId,
  onReply,
  onCancelReply,
  onToggleLike,
  likeBusyId,
}: {
  comments: CommunityCommentDto[];
  loading: boolean;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onSubmitComment: () => void;
  commentBusy: boolean;
  showCompose: boolean;
  replyToId: string | null;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onToggleLike: (commentId: string) => void;
  likeBusyId: string | null;
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
                  {c.author.isStaff ? (
                    <span className="fifa-forum-chip fifa-forum-chip--staff">Admin</span>
                  ) : (
                    <span className="font-semibold text-[var(--fifa-text-secondary)]">{c.author.displayName}</span>
                  )}
                  {" · "}
                  {formatRelativeTime(c.createdAt)}
                </p>
              </div>
              <CommunityBody text={c.bodyMd} className="mt-1.5 text-sm" />
              <div className="mt-1.5 flex items-center gap-3">
                <CommunityCommentLikeButton
                  comment={c}
                  busy={likeBusyId === c.id}
                  onToggle={() => onToggleLike(c.id)}
                />
                {showCompose ? (
                  <button
                    type="button"
                    onClick={() => onReply(c.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--fifa-accent-text)] hover:text-[var(--fifa-text)]"
                  >
                    <Reply className="h-3 w-3" aria-hidden />
                    Odpovědět
                  </button>
                ) : null}
              </div>
              {(repliesByParent[c.id] ?? []).map((r) => (
                <div key={r.id} className="ml-4 mt-2 border-l border-[var(--fifa-border)] pl-3">
                  <p className="text-[11px] text-[var(--fifa-text-muted)]">
                    {r.author.isStaff ? (
                      <span className="fifa-forum-chip fifa-forum-chip--staff">Admin</span>
                    ) : (
                      <span className="font-semibold text-[var(--fifa-text-secondary)]">{r.author.displayName}</span>
                    )}
                  </p>
                  <CommunityBody text={r.bodyMd} className="mt-1 text-sm" />
                  <div className="mt-1">
                    <CommunityCommentLikeButton
                      comment={r}
                      busy={likeBusyId === r.id}
                      onToggle={() => onToggleLike(r.id)}
                    />
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      {showCompose ? (
        <div className="mt-3">
          {replyToId ? (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-[var(--fifa-border)] bg-[var(--fifa-surface)] px-2.5 py-1.5 text-[11px] text-[var(--fifa-text-muted)]">
              <span>Odpovídáš na komentář</span>
              <button
                type="button"
                onClick={onCancelReply}
                className="text-[var(--fifa-text-muted)] hover:text-[var(--fifa-text)]"
                aria-label="Zrušit odpověď"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          <div className="fifa-forum-compose flex gap-2">
            <textarea
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              rows={2}
              placeholder={replyToId ? "Napsat odpověď…" : "Napsat komentář…"}
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
        </div>
      ) : null}
    </div>
  );
}
